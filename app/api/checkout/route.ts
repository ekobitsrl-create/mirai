import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getDemoProduct, isBlackIslandProduct, type StoreProduct } from '@/lib/products'
import { getStripeShippingOptions, SHIPPING_CONFIG } from '@/lib/shipping'

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
    const body = await request.json()
    const { items, priceId, paymentMethod, cancelPath } = body

    const quickPaymentMethod =
      paymentMethod === 'paypal' || paymentMethod === 'klarna'
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
    const productIds = items.map((item: { productId: string }) => item.productId)
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .in('id', productIds)

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
    const lineItems = items.map((cartItem: { productId: string; quantity: number; size?: string }) => {
      const product = checkoutProducts.find((p) => p?.id === cartItem.productId)
      if (!product) {
        throw new Error(`Prodotto ${cartItem.productId} non trovato`)
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name + (cartItem.size ? ` - Taglia ${cartItem.size}` : ''),
            description: product.description || undefined,
            images: product.image_url?.startsWith('http') ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(Number(product.price) * 100), // Stripe usa i centesimi
        },
        quantity: cartItem.quantity,
      }
    })

    const subtotalCents = lineItems.reduce(
      (total, item) => total + item.price_data.unit_amount * item.quantity,
      0
    )

    // Crea la sessione Stripe Checkout
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
      metadata: {
        order_items: JSON.stringify(items),
        ...(quickPaymentMethod ? { requested_payment_method: quickPaymentMethod } : {}),
      },
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
