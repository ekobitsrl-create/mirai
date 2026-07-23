'use server'

import { assertStripeCheckoutConfigured, stripe } from '@/lib/stripe'
import { createClient, getServerUser } from '@/lib/supabase/server'
import { getDemoProduct, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import { getStripeShippingOptions, SHIPPING_CONFIG } from '@/lib/shipping'
import { SITE_URL } from '@/lib/site-url'
import { applyOrderInventory } from '@/lib/orders/apply-order-inventory'
import { getEstimatedDeliveryDate } from '@/lib/google-customer-reviews'
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

export async function createCheckoutSession(cartItems: CartLineItem[], guestEmail?: string) {
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

  const session = await stripe.checkout.sessions.create({
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
    },
    payment_intent_data: {
      receipt_email: customerEmail,
      metadata: user ? { user_id: user.id } : {},
    },
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_CONFIG.allowedCountries],
    },
    shipping_options: getStripeShippingOptions(subtotalCents),
  })

  if (!session.client_secret) {
    throw new Error('Impossibile inizializzare il pagamento')
  }

  return { clientSecret: session.client_secret, sessionId: session.id }
}

function cleanDeliveryField(value: string, label: string, maximumLength: number) {
  const cleaned = (typeof value === 'string' ? value : '').replace(/\s+/g, ' ').trim().slice(0, maximumLength)
  if (!cleaned) throw new Error(`${label} obbligatorio`)
  return cleaned
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

  const total = validatedItems.reduce((amount, item) => amount + Number(item.product.price) * item.quantity, 0)
  const customizations = validatedItems
    .filter((item) => item.customization)
    .map((item) => `${item.product.name}: ${customizationSummary(item.customization!)}`)
  const orderNotes = ['Pagamento in contrassegno alla consegna', ...customizations].join(' | ')

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      email: customerEmail,
      status: 'pending',
      total,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_zip: shippingZip,
      shipping_country: 'IT',
      notes: orderNotes,
    })
    .select('id')
    .single()

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
  } catch (inventoryError) {
    console.error('Impossibile aggiornare le quantita del catalogo', inventoryError)
    throw new Error('Ordine registrato, ma la disponibilita del catalogo non e stata aggiornata')
  }

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
