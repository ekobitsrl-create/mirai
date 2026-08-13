import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { createClient, getServerUser } from '@/lib/supabase/server'
import { getDemoProduct, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import {
  getShippingCostCents,
  getStripeShippingOptions,
  normalizeShippingCountry,
} from '@/lib/shipping'
import {
  CUSTOM_TEE_PRODUCT_ID,
  customizationMetadata,
  customizationSummary,
  sanitizeCustomization,
} from '@/lib/customization'
import { getCatalogItemId } from '@/lib/catalog-identifiers'
import { SITE_URL } from '@/lib/site-url'
import {
  CHECKOUT_CONFIRMATION_METADATA_KEY,
  createCheckoutConfirmation,
} from '@/lib/checkout-confirmation'
import {
  consumeRateLimit,
  contentLengthWithin,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from '@/lib/request-security'

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
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Origine non valida' }, { status: 403 })
    }
    if (!contentLengthWithin(request, 128 * 1024)) {
      return NextResponse.json({ error: 'Richiesta troppo grande' }, { status: 413 })
    }
    if (!await consumeRateLimit({ bucket: 'checkout-api', limit: 20, windowSeconds: 600, request })) {
      return NextResponse.json({ error: 'Troppi tentativi. Riprova più tardi' }, { status: 429 })
    }
    assertStripeConfigured()
    const user = await getServerUser()
    let body: Record<string, unknown>
    try {
      body = await readJsonBody<Record<string, unknown>>(request, 128 * 1024)
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json({ error: 'Richiesta troppo grande' }, { status: 413 })
      }
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }
    const {
      items,
      paymentMethod,
      cancelPath,
      customerEmail: requestedEmail,
      shippingCountry: requestedShippingCountry,
    } = body
    let shippingCountry
    try {
      shippingCountry = normalizeShippingCountry(requestedShippingCountry || 'IT')
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Paese di spedizione non valido' },
        { status: 400 },
      )
    }
    const shippingFeeCents = getShippingCostCents(shippingCountry)
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
      ? {
          // Scalapay is supported by Stripe Checkout, but this project's pinned
          // Stripe SDK predates the corresponding TypeScript enum entry.
          payment_method_types: [
            quickPaymentMethod as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
          ],
        }
      : {}

    // Base URL per i redirect
    const baseUrl = SITE_URL
    const safeCancelPath =
      typeof cancelPath === 'string' && cancelPath.startsWith('/') && !cancelPath.startsWith('//')
        ? cancelPath
        : '/cancel'

    // Se vengono passati items dal carrello
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
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
      .select('id, name, description, price, image_url, stock_by_size, supplier_sku, color_name')
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
      if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 10) {
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
              meta_content_id: getCatalogItemId(staticProduct, cartItem.size || 'OS'),
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
    const confirmation = createCheckoutConfirmation()
    const sessionMetadata: Stripe.MetadataParam = {
      ...accountMetadata,
      shipping_country: shippingCountry,
      shipping_fee_cents: String(shippingFeeCents),
      [CHECKOUT_CONFIRMATION_METADATA_KEY]: confirmation.hash,
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
        allowed_countries: [shippingCountry],
      },
      phone_number_collection: {
        enabled: true,
      },
      shipping_options: getStripeShippingOptions(shippingCountry),
      // URL di redirect
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&confirmation_token=${encodeURIComponent(confirmation.token)}`,
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
