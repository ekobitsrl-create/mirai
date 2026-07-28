'use server'

import type Stripe from 'stripe'
import { assertStripeCheckoutConfigured, stripe } from '@/lib/stripe'
import { createClient, getServerUser } from '@/lib/supabase/server'
import { getDemoProduct, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import { getStripeShippingOptions, SHIPPING_CONFIG } from '@/lib/shipping'
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
  address: string
  city: string
  postalCode: string
  country: "IT"
}

function validEmail(value?: string) {
  const email = value?.trim().toLowerCase() || ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
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

export async function validateCheckoutDiscount(
  cartItems: CartLineItem[],
  guestEmail: string | undefined,
  discountCode: string,
) {
  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || guestEmail)
  if (!customerEmail) {
    throw new Error('Inserisci un indirizzo email valido prima di applicare il codice')
  }
  if (!cartItems.length) throw new Error('Il carrello è vuoto')

  const supabase = await createClient()
  const productIds = [...new Set(cartItems.map((item) => item.productId))]
  const { data: products, error } = await supabase
    .from('products')
    .select('id, price')
    .in('id', productIds)

  const demoProducts = productIds
    .map(getDemoProduct)
    .filter((product): product is StoreProduct => product !== null)
  const checkoutProducts = [...(products || []), ...demoProducts]
  if (error && checkoutProducts.length === 0) {
    throw new Error('Errore nel recupero dei prodotti')
  }

  const subtotalCents = cartItems.reduce((total, cartItem) => {
    const product = checkoutProducts.find((candidate) => candidate.id === cartItem.productId)
    if (!product) throw new Error(`Prodotto ${cartItem.productId} non trovato`)

    const quantity = Number(cartItem.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
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

export async function createCheckoutSession(
  cartItems: CartLineItem[],
  guestEmail?: string,
  marketingConsent = false,
  previousCheckoutSessionId?: string | null,
  discountCode?: string,
) {
  assertStripeCheckoutConfigured()
  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || guestEmail)
  if (!customerEmail) {
    throw new Error('Inserisci un indirizzo email valido per ricevere la conferma ordine')
  }

  if (!cartItems.length) {
    throw new Error('Il carrello è vuoto')
  }

  const supabase = await createClient()

  const productIds = cartItems.map((item) => item.productId)
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock_by_size')
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

  const lineItems = cartItems.map((cartItem) => {
    const product = checkoutProducts.find((p) => p?.id === cartItem.productId)
    if (!product) {
      throw new Error(`Prodotto ${cartItem.productId} non trovato`)
    }

    const requestedQuantity = Number(cartItem.quantity)
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      throw new Error(`Quantità non valida per ${product.name}`)
    }

    const staticProduct = product as StoreProduct
    if (staticProduct.stock_by_size) {
      const requestedSize = cartItem.size || ""
      const sizeStock = staticProduct.stock_by_size[requestedSize]
      if (!sizeStock) {
        throw new Error(`Taglia ${requestedSize || "non selezionata"} non disponibile per ${product.name}`)
      }
      if (requestedQuantity > sizeStock) {
        throw new Error(`Sono disponibili solo ${sizeStock} pezzi di ${product.name} in taglia ${requestedSize}`)
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
          name: product.name + (cartItem.size ? ` - Taglia ${cartItem.size}` : ''),
          description: customization ? customizationSummary(customization) : product.description || undefined,
          images: product.image_url
            ? [product.image_url.startsWith('http') ? product.image_url : `${baseUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`]
            : undefined,
          metadata: {
            product_id: product.id,
            ...(cartItem.size ? { size: cartItem.size } : {}),
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
        customerEmail,
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

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    ui_mode: 'embedded',
    redirect_on_completion: 'if_required',
    return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    line_items: lineItems,
    mode: 'payment',
    customer_creation: 'if_required',
    customer_email: customerEmail,
    ...(user ? { client_reference_id: user.id } : {}),
    metadata: {
      order_item_count: String(cartItems.length),
      ...(user ? { user_id: user.id } : {}),
      ...discountMetadata,
    },
    payment_intent_data: {
      receipt_email: customerEmail,
      metadata: {
        ...(user ? { user_id: user.id } : {}),
        ...discountMetadata,
      },
    },
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_CONFIG.allowedCountries],
    },
    shipping_options: getStripeShippingOptions(subtotalCents),
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

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
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

export async function createCashOnDeliveryOrder(cartItems: CartLineItem[], details: CashOnDeliveryDetails) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Il servizio ordini non e configurato')
  }

  if (details.country !== 'IT') {
    throw new Error('Il contrassegno e disponibile solo per consegne in Italia')
  }

  const user = await getServerUser()
  const customerEmail = validEmail(user?.email || details.guestEmail)
  if (!customerEmail) {
    throw new Error('Inserisci un indirizzo email valido')
  }

  if (!cartItems.length) {
    throw new Error('Il carrello e vuoto')
  }

  const shippingName = cleanDeliveryField(details.name, 'Nome e cognome', 120)
  const shippingAddress = cleanDeliveryField(details.address, 'Indirizzo', 180)
  const shippingCity = cleanDeliveryField(details.city, 'Citta', 80)
  const shippingZip = cleanDeliveryField(details.postalCode, 'CAP', 16)
  if (!/^\d{5}$/.test(shippingZip)) {
    throw new Error('Inserisci un CAP italiano valido')
  }

  const supabase = await createClient()
  const productIds = [...new Set(cartItems.map((item) => item.productId))]
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, stock_by_size')
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

  const validatedItems = cartItems.map((cartItem) => {
    const product = checkoutProducts.find((candidate) => candidate?.id === cartItem.productId)
    if (!product) throw new Error(`Prodotto ${cartItem.productId} non trovato`)

    const quantity = Number(cartItem.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Quantita non valida per ${product.name}`)
    }

    const staticProduct = product as StoreProduct
    if (staticProduct.stock_by_size) {
      const requestedSize = cartItem.size || ''
      const sizeStock = staticProduct.stock_by_size[requestedSize]
      if (!sizeStock || quantity > sizeStock) {
        throw new Error(`La taglia ${requestedSize || 'selezionata'} non e disponibile per ${product.name}`)
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
        customerEmail,
        subtotalCents,
      })
    : null
  const totalCents = appliedDiscount?.totalCents ?? subtotalCents
  const customizations = validatedItems
    .filter((item) => item.customization)
    .map((item) => `${item.product.name}: ${customizationSummary(item.customization!)}`)
  const orderNotes = [
    'Pagamento in contrassegno alla consegna',
    ...(appliedDiscount
      ? [`Codice sconto ${appliedDiscount.code}: -€${(appliedDiscount.discountCents / 100).toFixed(2)}`]
      : []),
    ...customizations,
  ].join(' | ')

  const baseOrderPayload = {
    user_id: user?.id || null,
    email: customerEmail,
    status: 'pending',
    total: totalCents / 100,
    shipping_name: shippingName,
    shipping_address: shippingAddress,
    shipping_city: shippingCity,
    shipping_zip: shippingZip,
    shipping_country: 'IT',
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

  await markCheckoutRecovered({ email: customerEmail })
  await sendOrderConfirmationEmail(order.id, 'cash_on_delivery')

  return {
    orderId: order.id,
    review: {
      orderId: order.id,
      email: customerEmail,
      deliveryCountry: 'IT',
      estimatedDeliveryDate: getEstimatedDeliveryDate(SHIPPING_CONFIG.standardDeliveryDays.maximum),
    },
  }
}
