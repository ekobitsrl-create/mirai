'use server'

import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { createClient, getServerUser } from '@/lib/supabase/server'
import { getDemoProduct, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import { getStripeShippingOptions, SHIPPING_CONFIG } from '@/lib/shipping'
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

export async function createCheckoutSession(cartItems: CartLineItem[]) {
  assertStripeConfigured()
  const user = await getServerUser()
  if (!user?.email) {
    throw new Error('Accedi o crea il tuo MIRAI PASS per completare il pagamento')
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

  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://mirai-clothing.vercel.app'
  const baseUrl = configuredBaseUrl.replace(/\/$/, '')

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
    customer_creation: 'always',
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      order_item_count: String(cartItems.length),
    },
    payment_intent_data: {
      receipt_email: user.email,
      metadata: { user_id: user.id },
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
