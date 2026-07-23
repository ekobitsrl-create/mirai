import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
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
import { getPremiumProductTitle } from '@/lib/product-titles'

type CheckoutCartItem = {
  productId: string
  quantity: number
  size?: string
  lineId?: string
  customization?: unknown
}

function validEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

/**
 * POST /api/checkout
 * Crea una Stripe Checkout Session e restituisce l'URL per il redirect
 * 
 * Body:
 * - items: Array di { productId: string, quantity: number, size?: string }
 * - oppure priceId: string (per prodotti già configurati su Stripe)
 */
export async function POST(request: NextRequest) {
  try {
    assertStripeConfigured()
    const user = await getServerUser()
    const body = await request.json()
    const { items, priceId, paymentMethod, cancelPath, customerEmail: requestedEmail } = body
    const customerEmail = validEmail(user?.email || requestedEmail)
    const accountMetadata: Stripe.MetadataParam = user ? { user_id: user.id } : {}
    const customerParams: Pick<
      Stripe.Checkout.SessionCreateParams,
      'customer_creation' | 'customer_email' | 'client_reference_id' | 'payment_intent_data'
    > = {
      customer_creation: 'if_required' as const,
    }
    if (customerEmail) {
      customerParams.customer_email = customerEmail
      customerParams.payment_intent_data = {
        receipt_email: customerEmail,
        metadata: accountMetadata,
      }
    }
    if (user) customerParams.client_reference_id = user.id

    const quickPaymentMethod =
      paymentMethod === 'paypal' || paymentMethod === 'klarna' || paymentMethod === 'scalapay'
        ? paymentMethod
        : null

    if (paymentMethod && !quickPaymentMethod) {
      return NextResponse.json(
        { error: 'Metodo di pagamento non supportato' },
        { status: 400 }
      )
    }

    const paymentMethodParams: Pick<Stripe.Checkout.SessionCreateParams, 'payment_method_types'> | Record<string, never> = quickPaymentMethod
      ? { payment_method_types: [quickPaymentMethod] }
      : {}

    // Base URL per i redirect
    const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
    const baseUrl = (configuredBaseUrl || request.nextUrl.origin).replace(/\/$/, '')
    const safeCancelPath =
      typeof cancelPath === 'string' && cancelPath.startsWith('/') && !cancelPath.startsWith('//')
        ? cancelPath
        : '/cancel'

    // Se viene passato un priceId diretto (prodotto Stripe)
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId)
      if (price.unit_amount === null) {
        throw new Error('Prezzo Stripe non valido')
      }

      const priceMetadata: Stripe.MetadataParam = { ...accountMetadata, order_item_count: '1' }
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ...paymentMethodParams,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        shipping_address_collection: {
          allowed_countries: [...SHIPPING_CONFIG.allowedCountries],
        },
        shipping_options: getStripeShippingOptions(price.unit_amount),
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}${safeCancelPath}`,
        ...customerParams,
        metadata: priceMetadata,
      })

      return NextResponse.json({ url: session.url })
    }

    // Se vengono passati items dal carrello
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrello vuoto o dati non validi' },
        { status: 400 }
      )
    }

    // Recupera i prodotti dal database
    const supabase = await createClient()
    const productIds = items.map((item: CheckoutCartItem) => item.productId)
    
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
    const checkoutProducts = [...(products || []), ...demoProducts].map((product) => ({
      ...product,
      name: getPremiumProductTitle(product),
    }))

    if (error && checkoutProducts.length === 0) {
      return NextResponse.json(
        { error: 'Errore nel recupero dei prodotti' },
        { status: 500 }
      )
    }

    if (checkoutProducts.some(isBlackIslandProduct)) {
      return NextResponse.json(
        { error: 'Uno dei prodotti selezionati non è più disponibile' },
        { status: 400 }
      )
    }

    // Costruisci i line items per Stripe
    const lineItems = items.map((cartItem: CheckoutCartItem) => {
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
          unit_amount: Math.round(Number(product.price) * 100), // Stripe usa i centesimi
        },
        quantity: requestedQuantity,
      }
    })

    const subtotalCents = lineItems.reduce(
      (total, item) => total + item.price_data.unit_amount * item.quantity,
      0
    )

    const compactOrderItems = JSON.stringify(items.map((item: CheckoutCartItem) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      lineId: item.lineId,
    })))

    // Crea la sessione Stripe Checkout
    const sessionMetadata: Stripe.MetadataParam = {
      ...accountMetadata,
      ...(compactOrderItems.length <= 500
        ? { order_items: compactOrderItems }
        : { order_item_count: String(items.length) }),
      ...(quickPaymentMethod ? { requested_payment_method: quickPaymentMethod } : {}),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...paymentMethodParams,
      line_items: lineItems,
      // Raccolta indirizzo di spedizione
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_CONFIG.allowedCountries],
      },
      shipping_options: getStripeShippingOptions(subtotalCents),
      // URL di redirect
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${safeCancelPath}`,
      // Metadata per tracciamento ordine
      metadata: sessionMetadata,
      ...customerParams,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Errore creazione checkout session:', error)
    return NextResponse.json(
      { error: 'Errore durante la creazione della sessione di pagamento' },
      { status: 500 }
    )
  }
}
