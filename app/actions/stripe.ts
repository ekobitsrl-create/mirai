'use server'

import type Stripe from 'stripe'
import { assertStripeCheckoutConfigured, stripe } from '@/lib/stripe'
import { createAdminClient, getServerUser } from '@/lib/supabase/server'
import { canAccessStoreProduct, getDemoProduct, getSupplierProfile, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import {
  getShippingCostCents,
  getStripeShippingOptions,
  normalizeShippingCountry,
  SHIPPING_CONFIG,
} from '@/lib/shipping'
import { CASH_ON_DELIVERY_FEE_CENTS } from '@/lib/checkout-fees'
import { SITE_URL } from '@/lib/site-url'
import { applyOrderInventory } from '@/lib/orders/apply-order-inventory'
import { getEstimatedDeliveryDate } from '@/lib/google-customer-reviews'
import { markCheckoutRecovered, saveAbandonedCheckout } from '@/lib/email/abandoned-cart'
import { sendOrderConfirmationEmail } from '@/lib/email/order-emails'
import {
  recordDiscountUsage,
  validateDiscountCode,
  type AppliedDiscount,
} from '@/lib/discounts'
import {
  CUSTOM_TEE_PRODUCT_ID,
  customizationMetadata,
  customizationSummary,
  sanitizeCustomization,
} from '@/lib/customization'
import { getCatalogItemId } from '@/lib/catalog-identifiers'
import {
  CHECKOUT_CONFIRMATION_METADATA_KEY,
  createCashOnDeliveryConfirmation,
  createCheckoutConfirmation,
} from '@/lib/checkout-confirmation'
import { consumeRateLimit } from '@/lib/request-security'
import { sendMetaPurchaseEvent } from '@/lib/meta-conversions-server'
import { parseQuickPaymentMethod, type QuickPaymentMethod } from '@/lib/quick-payment'
import { stylizeBrandText } from '@/lib/brand'

type CartLineItem = {
  productId: string
  quantity: number
  size?: string
  lineId?: string
  customization?: unknown
}

export type CashOnDeliveryDetails = {
  guestEmail?: string
  discountCode?: string
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

function validEmail(value?: string) {
  const email = value?.trim().toLowerCase() || ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

function validPhone(value?: string) {
  const phone = value?.replace(/\s+/g, ' ').trim() || ''
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? phone.slice(0, 24) : null
}

function stripeCouponId(discount: AppliedDiscount) {
  const safeCode = discount.code.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  const safeValue = String(discount.value).replace(/[^0-9]/g, '_')
  return `mirai_${safeCode}_${discount.type}_${safeValue}`
}

async function ensureStripeCoupon(discount: AppliedDiscount) {
  const couponId = stripeCouponId(discount)

  try {
    const existing = await stripe.coupons.retrieve(couponId)
    if (!('deleted' in existing && existing.deleted)) return existing.id
  } catch (error) {
    const stripeError = error as { code?: string; statusCode?: number }
    if (stripeError.code !== 'resource_missing' && stripeError.statusCode !== 404) throw error
  }

  const couponData = discount.type === 'percentage'
    ? { percent_off: discount.value }
    : { amount_off: Math.round(discount.value * 100), currency: 'eur' as const }

  try {
    const created = await stripe.coupons.create({
      id: couponId,
      duration: 'once',
      name: discount.code,
      metadata: {
        mirai_discount_code: discount.code,
        mirai_discount_type: discount.type,
        mirai_discount_value: String(discount.value),
      },
      ...couponData,
    })
    return created.id
  } catch (error) {
    // Two checkouts may create the same deterministic coupon concurrently.
    const existing = await stripe.coupons.retrieve(couponId)
    if (!('deleted' in existing && existing.deleted)) return existing.id
    throw error
  }
}

const SAFE_CHECKOUT_ERROR_PREFIXES = [
  'Troppe richieste',
  'Troppi tentativi',
  'Inserisci ',
  "L'indirizzo email",
  'Il carrello',
  'Errore nel recupero dei prodotti',
  'Uno dei prodotti',
  'Prodotto ',
  'Quantità ',
  'Taglia ',
  'Sono disponibili ',
  'Personalizzazione ',
  'Impossibile inizializzare il pagamento',
  'Non è stato possibile verificare',
  'Codice sconto',
  'Questo codice',
  'Il codice',
]

function safeCheckoutErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : ''
  if (message.startsWith('Prodotto ')) {
    return 'Uno dei prodotti nel carrello non è più disponibile'
  }
  return SAFE_CHECKOUT_ERROR_PREFIXES.some((prefix) => message.startsWith(prefix))
    ? message
    : fallback
}

function logCheckoutActionError(operation: string, error: unknown) {
  const message = error instanceof Error ? error.message.trim() : ''
  if (SAFE_CHECKOUT_ERROR_PREFIXES.some((prefix) => message.startsWith(prefix))) return
  console.error(`[checkout:${operation}]`, error)
}

async function validateCheckoutDiscountInternal(
  cartItems: CartLineItem[],
  guestEmail: string | undefined,
  discountCode: string,
) {
  if (!await consumeRateLimit({ bucket: 'discount-validation', limit: 30, windowSeconds: 600 })) {
    throw new Error('Troppe richieste. Riprova tra qualche minuto')
  }
  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || guestEmail)
  if (!customerEmail) {
    throw new Error('Inserisci un indirizzo email valido prima di applicare il codice')
  }
  if (!cartItems.length || cartItems.length > 50) throw new Error('Il carrello non è valido')

  const supabase = createAdminClient()
  const productIds = [...new Set(cartItems.map((item) => item.productId))]
  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, is_published, community_only')
    .in('id', productIds)

  const demoProducts = productIds
    .map(getDemoProduct)
    .filter((product): product is StoreProduct => product !== null)
  const checkoutProducts = [...(products || []), ...demoProducts]
  if (error && checkoutProducts.length === 0) {
    throw new Error('Errore nel recupero dei prodotti')
  }
  if (checkoutProducts.some((product) => !canAccessStoreProduct(product, Boolean(user)))) {
    throw new Error('Uno dei prodotti selezionati non è al momento disponibile')
  }

  const subtotalCents = cartItems.reduce((total, cartItem) => {
    const product = checkoutProducts.find((candidate) => candidate.id === cartItem.productId)
    if (!product) throw new Error(`Prodotto ${cartItem.productId} non trovato`)

    const quantity = Number(cartItem.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('Quantità non valida nel carrello')
    }

    return total + Math.round(Number(product.price) * 100) * quantity
  }, 0)

  return validateDiscountCode({
    supabase,
    code: discountCode,
    customerEmail,
    subtotalCents,
  })
}

export async function validateCheckoutDiscount(
  cartItems: CartLineItem[],
  guestEmail: string | undefined,
  discountCode: string,
) {
  try {
    const discount = await validateCheckoutDiscountInternal(cartItems, guestEmail, discountCode)
    return { ok: true as const, discount }
  } catch (error) {
    logCheckoutActionError('discount-validation', error)
    return {
      ok: false as const,
      error: safeCheckoutErrorMessage(
        error,
        'Non è stato possibile verificare il codice sconto. Riprova.',
      ),
    }
  }
}

async function createCheckoutSessionInternal(
  cartItems: CartLineItem[],
  guestEmail?: string,
  marketingConsent = false,
  previousCheckoutSessionId?: string | null,
  discountCode?: string,
  requestedShippingCountry: string = 'IT',
  requestedQuickPaymentMethod?: QuickPaymentMethod,
) {
  if (!await consumeRateLimit({ bucket: 'stripe-checkout', limit: 20, windowSeconds: 600 })) {
    throw new Error('Troppi tentativi di pagamento. Riprova tra qualche minuto')
  }
  assertStripeCheckoutConfigured()
  const shippingCountry = normalizeShippingCountry(requestedShippingCountry)
  const quickPaymentMethod = parseQuickPaymentMethod(requestedQuickPaymentMethod)
  const shippingFeeCents = getShippingCostCents(shippingCountry)
  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || guestEmail)
  if ((user?.email || guestEmail)?.trim() && !customerEmail) {
    throw new Error("L'indirizzo email inserito non è valido")
  }
  if (discountCode && !customerEmail) {
    throw new Error('Inserisci un indirizzo email valido per applicare il codice sconto')
  }

  if (!cartItems.length || cartItems.length > 50) {
    throw new Error('Il carrello è vuoto')
  }

  const supabase = createAdminClient()

  const productIds = cartItems.map((item) => item.productId)
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock_by_size, supplier_sku, color_name, is_published, community_only, is_preorder, preorder_release_at')
    .in('id', productIds)

  if (error?.message.includes('stock_by_size')) {
    const legacyResult = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .in('id', productIds)
    products = legacyResult.data as typeof products
    error = legacyResult.error
  }

  const baseUrl = SITE_URL

  const demoProducts = productIds
    .map(getDemoProduct)
    .filter((product): product is StoreProduct => product !== null)
  const checkoutProducts = [...(products || []), ...demoProducts]

  if (error && checkoutProducts.length === 0) throw new Error('Errore nel recupero dei prodotti')

  if (checkoutProducts.some(isBlackIslandProduct)) {
    throw new Error('Uno dei prodotti selezionati non è più disponibile')
  }
  if (checkoutProducts.some((product) => !canAccessStoreProduct(product, Boolean(user)))) {
    throw new Error('Uno dei prodotti selezionati è in bozza e non può essere acquistato')
  }

  const lineItems = cartItems.map((cartItem) => {
    const product = checkoutProducts.find((p) => p?.id === cartItem.productId)
    if (!product) {
      throw new Error(`Prodotto ${cartItem.productId} non trovato`)
    }

    const requestedQuantity = Number(cartItem.quantity)
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 10) {
      throw new Error(`Quantità non valida per ${stylizeBrandText(product.name)}`)
    }

    const staticProduct = product as StoreProduct
    if (staticProduct.stock_by_size) {
      const requestedSize = cartItem.size || ""
      const sizeStock = staticProduct.stock_by_size[requestedSize]
      if (!sizeStock) {
        throw new Error(`Taglia ${requestedSize || "non selezionata"} non disponibile per ${stylizeBrandText(product.name)}`)
      }
      if (requestedQuantity > sizeStock) {
        throw new Error(`Sono disponibili solo ${sizeStock} pezzi di ${stylizeBrandText(product.name)} in taglia ${requestedSize}`)
      }
    }

    const customization = cartItem.productId === CUSTOM_TEE_PRODUCT_ID
      ? sanitizeCustomization(cartItem.customization)
      : null
    if (cartItem.productId === CUSTOM_TEE_PRODUCT_ID && !customization) {
      throw new Error('Personalizzazione della T-shirt non valida')
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: stylizeBrandText(product.name) + (cartItem.size ? ` - Taglia ${cartItem.size}` : ''),
          description: customization ? customizationSummary(customization) : product.description ? stylizeBrandText(product.description) : undefined,
          images: product.image_url
            ? [product.image_url.startsWith('http') ? product.image_url : `${baseUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`]
            : undefined,
          metadata: {
            product_id: product.id,
            meta_content_id: getCatalogItemId(staticProduct, cartItem.size || 'OS'),
            ...(cartItem.size ? { size: cartItem.size } : {}),
            is_preorder: product.is_preorder ? 'true' : 'false',
            ...(product.preorder_release_at ? { preorder_release_at: product.preorder_release_at } : {}),
            ...(customization ? customizationMetadata(customization) : {}),
          },
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: requestedQuantity,
    }
  })

  const subtotalCents = lineItems.reduce(
    (total, item) => total + item.price_data.unit_amount * item.quantity,
    0
  )
  const appliedDiscount = discountCode
    ? await validateDiscountCode({
        supabase,
        code: discountCode,
        customerEmail: customerEmail!,
        subtotalCents,
      })
    : null
  const couponId = appliedDiscount ? await ensureStripeCoupon(appliedDiscount) : null
  const discountMetadata: Record<string, string> = {}
  if (appliedDiscount) {
    discountMetadata.discount_code = appliedDiscount.code
    discountMetadata.discount_type = appliedDiscount.type
    discountMetadata.discount_value = String(appliedDiscount.value)
    discountMetadata.discount_amount_cents = String(appliedDiscount.discountCents)
    discountMetadata.subtotal_cents = String(appliedDiscount.subtotalCents)
  }

  const confirmation = createCheckoutConfirmation()
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    ui_mode: 'embedded',
    redirect_on_completion: 'if_required',
    return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&confirmation_token=${encodeURIComponent(confirmation.token)}`,
    line_items: lineItems,
    mode: 'payment',
    customer_creation: 'if_required',
    ...(quickPaymentMethod
      ? {
          payment_method_types: [
            quickPaymentMethod as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
          ],
        }
      : {}),
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    ...(user ? { client_reference_id: user.id } : {}),
    metadata: {
      order_item_count: String(cartItems.length),
      shipping_country: shippingCountry,
      shipping_fee_cents: String(shippingFeeCents),
      ...(quickPaymentMethod ? { requested_payment_method: quickPaymentMethod } : {}),
      [CHECKOUT_CONFIRMATION_METADATA_KEY]: confirmation.hash,
      ...(user ? { user_id: user.id } : {}),
      ...discountMetadata,
    },
    payment_intent_data: {
      ...(customerEmail ? { receipt_email: customerEmail } : {}),
      metadata: {
        shipping_country: shippingCountry,
        shipping_fee_cents: String(shippingFeeCents),
        ...(user ? { user_id: user.id } : {}),
        ...discountMetadata,
      },
    },
    shipping_address_collection: {
      allowed_countries: [shippingCountry],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: getStripeShippingOptions(shippingCountry),
  }

  if (couponId) {
    sessionParams.discounts = [{ coupon: couponId }]
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.client_secret) {
    throw new Error('Impossibile inizializzare il pagamento')
  }

  if (previousCheckoutSessionId && previousCheckoutSessionId !== session.id) {
    await markCheckoutRecovered({ checkoutSessionId: previousCheckoutSessionId })
  }

  if (customerEmail) {
    await saveAbandonedCheckout({
      checkoutSessionId: session.id,
      email: customerEmail,
      consent: marketingConsent,
      items: lineItems.map((item) => ({
        name: item.price_data.product_data.name,
        quantity: item.quantity,
        price: item.price_data.unit_amount / 100,
        image: item.price_data.product_data.images?.[0] || null,
        size: item.price_data.product_data.metadata.size || null,
      })),
    })
  }

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
    confirmationToken: confirmation.token,
    discount: appliedDiscount,
  }
}

function cleanDeliveryField(value: string, label: string, maximumLength: number) {
  const cleaned = (typeof value === 'string' ? value : '').replace(/\s+/g, ' ').trim().slice(0, maximumLength)
  if (!cleaned) throw new Error(`${label} obbligatorio`)
  return cleaned
}

function isMissingDiscountOrderColumns(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() || ''
  return error?.code === 'PGRST204'
    && (message.includes('subtotal') || message.includes('discount_'))
}

/**
 * Cash on delivery (contrassegno) is only offered for carts made up entirely of
 * Minimal-brand products. Returns whether every product in the cart belongs to the
 * "minimal" supplier profile.
 */
export async function getCashOnDeliveryEligibility(cartItems: CartLineItem[]) {
  if (!cartItems.length) return { eligible: false }

  const user = await getServerUser()
  const supabase = createAdminClient()
  const productIds = [...new Set(cartItems.map((item) => item.productId))]
  const { data: products, error } = await supabase
    .from('products')
    .select('id, brand, supplier_profile, is_published, community_only')
    .in('id', productIds)

  const demoProducts = productIds
    .map(getDemoProduct)
    .filter((product): product is StoreProduct => product !== null)
  const checkoutProducts = [...(products || []), ...demoProducts]

  if (error && checkoutProducts.length === 0) return { eligible: false }
  if (checkoutProducts.some((product) => !canAccessStoreProduct(product, Boolean(user)))) return { eligible: false }

  const eligible = productIds.every((productId) => {
    const product = checkoutProducts.find((candidate) => candidate?.id === productId)
    if (!product) return false
    return getSupplierProfile(product) === 'minimal'
  })

  return { eligible }
}

export async function createCashOnDeliveryOrder(cartItems: CartLineItem[], details: CashOnDeliveryDetails) {
  if (!await consumeRateLimit({ bucket: 'cash-on-delivery', limit: 5, windowSeconds: 3600 })) {
    throw new Error('Troppi tentativi di ordine. Riprova più tardi')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Il servizio ordini non e configurato')
  }

  const shippingCountry = normalizeShippingCountry(details.country)
  const shippingFeeCents = getShippingCostCents(shippingCountry)

  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || details.guestEmail)
  if ((user?.email || details.guestEmail)?.trim() && !customerEmail) {
    throw new Error("L'indirizzo email inserito non è valido")
  }
  if (details.discountCode && !customerEmail) {
    throw new Error('Inserisci un indirizzo email valido per applicare il codice sconto')
  }

  if (!cartItems.length || cartItems.length > 50) {
    throw new Error('Il carrello e vuoto')
  }

  const shippingName = cleanDeliveryField(details.name, 'Nome e cognome', 120)
  const shippingPhone = validPhone(details.phone)
  if (!shippingPhone) {
    throw new Error('Inserisci un numero di telefono valido')
  }
  const shippingAddress = cleanDeliveryField(details.address, 'Indirizzo', 180)
  const shippingCity = cleanDeliveryField(details.city, 'Citta', 80)
  const shippingZip = cleanDeliveryField(details.postalCode, 'CAP', 16)
  if (shippingCountry === 'IT' && !/^\d{5}$/.test(shippingZip)) {
    throw new Error('Inserisci un CAP italiano valido')
  }

  const supabase = createAdminClient()
  const productIds = [...new Set(cartItems.map((item) => item.productId))]
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock_by_size, supplier_sku, color_name, supplier_profile, brand, is_published, community_only, is_preorder, preorder_release_at')
    .in('id', productIds)

  if (error?.message.includes('stock_by_size')) {
    const legacyResult = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .in('id', productIds)
    products = legacyResult.data as typeof products
    error = legacyResult.error
  }

  const demoProducts = productIds
    .map(getDemoProduct)
    .filter((product): product is StoreProduct => product !== null)
  const checkoutProducts = [...(products || []), ...demoProducts]

  if (error && checkoutProducts.length === 0) throw new Error('Errore nel recupero dei prodotti')
  if (checkoutProducts.some(isBlackIslandProduct)) {
    throw new Error('Uno dei prodotti selezionati non e piu disponibile')
  }
  if (checkoutProducts.some((product) => !canAccessStoreProduct(product, Boolean(user)))) {
    throw new Error('Uno dei prodotti selezionati è in bozza e non può essere acquistato')
  }

  // Il contrassegno è riservato ai prodotti del brand Minimal.
  const allMinimal = productIds.every((productId) => {
    const product = checkoutProducts.find((candidate) => candidate?.id === productId)
    return product ? getSupplierProfile(product) === 'minimal' : false
  })
  if (!allMinimal) {
    throw new Error('Il contrassegno è disponibile solo per i prodotti del brand Minimal')
  }

  const validatedItems = cartItems.map((cartItem) => {
    const product = checkoutProducts.find((candidate) => candidate?.id === cartItem.productId)
    if (!product) throw new Error(`Prodotto ${cartItem.productId} non trovato`)

    const quantity = Number(cartItem.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Quantita non valida per ${stylizeBrandText(product.name)}`)
    }

    const staticProduct = product as StoreProduct
    if (staticProduct.stock_by_size) {
      const requestedSize = cartItem.size || ''
      const sizeStock = staticProduct.stock_by_size[requestedSize]
      if (!sizeStock || quantity > sizeStock) {
        throw new Error(`La taglia ${requestedSize || 'selezionata'} non e disponibile per ${stylizeBrandText(product.name)}`)
      }
    }

    const customization = cartItem.productId === CUSTOM_TEE_PRODUCT_ID
      ? sanitizeCustomization(cartItem.customization)
      : null
    if (cartItem.productId === CUSTOM_TEE_PRODUCT_ID && !customization) {
      throw new Error('Personalizzazione della T-shirt non valida')
    }

    return { cartItem, product: staticProduct, quantity, customization }
  })

  const subtotalCents = validatedItems.reduce(
    (amount, item) => amount + Math.round(Number(item.product.price) * 100) * item.quantity,
    0,
  )
  const appliedDiscount = details.discountCode
    ? await validateDiscountCode({
        supabase,
        code: details.discountCode,
        customerEmail: customerEmail!,
        subtotalCents,
      })
    : null
  const discountedProductsTotalCents = appliedDiscount?.totalCents ?? subtotalCents
  const totalCents = discountedProductsTotalCents + shippingFeeCents + CASH_ON_DELIVERY_FEE_CENTS
  const customizations = validatedItems
    .filter((item) => item.customization)
    .map((item) => `${stylizeBrandText(item.product.name)}: ${customizationSummary(item.customization!)}`)
  const orderNotes = [
    'Pagamento in contrassegno alla consegna',
    `Supplemento contrassegno: €${(CASH_ON_DELIVERY_FEE_CENTS / 100).toFixed(2)}`,
    shippingFeeCents > 0
      ? `Spedizione UE: €${(shippingFeeCents / 100).toFixed(2)}`
      : 'Spedizione Italia: gratuita',
    `Telefono: ${shippingPhone}`,
    ...(appliedDiscount
      ? [`Codice sconto ${appliedDiscount.code}: -€${(appliedDiscount.discountCents / 100).toFixed(2)}`]
      : []),
    ...customizations,
  ].join(' | ')

  const baseOrderPayload = {
    user_id: user?.id || null,
    email: customerEmail || '',
    status: 'pending',
    total: totalCents / 100,
    shipping_name: shippingName,
    shipping_address: shippingAddress,
    shipping_city: shippingCity,
    shipping_zip: shippingZip,
    shipping_country: shippingCountry,
    notes: orderNotes,
  }

  let orderResult = await supabase
    .from('orders')
    .insert({
      ...baseOrderPayload,
      subtotal: subtotalCents / 100,
      discount_code: appliedDiscount?.code || null,
      discount_type: appliedDiscount?.type || null,
      discount_value: appliedDiscount?.value || null,
      discount_amount: (appliedDiscount?.discountCents || 0) / 100,
    })
    .select('id')
    .single()

  if (orderResult.error && isMissingDiscountOrderColumns(orderResult.error)) {
    orderResult = await supabase
      .from('orders')
      .insert(baseOrderPayload)
      .select('id')
      .single()
  }

  const { data: order, error: orderError } = orderResult
  if (orderError || !order) {
    throw new Error('Non e stato possibile registrare l ordine')
  }

  const orderItems = validatedItems.map(({ cartItem, product, quantity }) => ({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name + (cartItem.size ? ` - Taglia ${cartItem.size}` : ''),
    product_image: product.image_url,
    size: cartItem.size || null,
    quantity,
    price: Number(product.price),
    is_preorder: Boolean(product.is_preorder),
    preorder_release_at: product.preorder_release_at || null,
  }))
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Non e stato possibile registrare gli articoli dell ordine')
  }

  try {
    await applyOrderInventory(supabase, order.id, { allowLegacyFallback: true })
    await recordDiscountUsage(supabase, appliedDiscount?.code)
  } catch (inventoryError) {
    console.error('Impossibile aggiornare le quantita del catalogo', inventoryError)
    throw new Error('Ordine registrato, ma la disponibilita del catalogo non e stata aggiornata')
  }

  if (customerEmail) {
    await markCheckoutRecovered({ email: customerEmail })
  }
  await sendOrderConfirmationEmail(order.id, 'cash_on_delivery')

  const meta = {
      content_ids: [...new Set(validatedItems.map(({ cartItem, product }) => (
        getCatalogItemId(product, cartItem.size || 'OS')
      )))],
      content_type: 'product' as const,
      value: totalCents / 100,
      currency: 'EUR',
      contents: validatedItems.map(({ cartItem, product, quantity }) => ({
        id: getCatalogItemId(product, cartItem.size || 'OS'),
        quantity,
        item_price: Number(product.price),
      })),
      num_items: validatedItems.reduce((total, item) => total + item.quantity, 0),
    }

  await sendMetaPurchaseEvent({
    eventId: order.id,
    email: customerEmail,
    customData: meta,
  })

  return {
    orderId: order.id,
    confirmationToken: createCashOnDeliveryConfirmation(order.id),
    meta,
    review: {
      orderId: order.id,
      email: customerEmail || '',
      deliveryCountry: shippingCountry,
      estimatedDeliveryDate: getEstimatedDeliveryDate(SHIPPING_CONFIG.standardDeliveryDays.maximum),
    },
  }
}

export async function createCheckoutSession(
  cartItems: CartLineItem[],
  guestEmail?: string,
  marketingConsent = false,
  previousCheckoutSessionId?: string | null,
  discountCode?: string,
  requestedShippingCountry: string = 'IT',
  requestedQuickPaymentMethod?: QuickPaymentMethod,
) {
  try {
    const session = await createCheckoutSessionInternal(
      cartItems,
      guestEmail,
      marketingConsent,
      previousCheckoutSessionId,
      discountCode,
      requestedShippingCountry,
      requestedQuickPaymentMethod,
    )
    return { ok: true as const, session }
  } catch (error) {
    logCheckoutActionError('stripe-session', error)
    return {
      ok: false as const,
      error: safeCheckoutErrorMessage(
        error,
        'Non è stato possibile preparare il pagamento. Riprova.',
      ),
    }
  }
}
