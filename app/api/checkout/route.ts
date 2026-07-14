import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

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
    const body = await request.json()
    const { items, priceId } = body

    // Base URL per i redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Se viene passato un priceId diretto (prodotto Stripe)
    if (priceId) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
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

    if (error || !products) {
      return NextResponse.json(
        { error: 'Errore nel recupero dei prodotti' },
        { status: 500 }
      )
    }

    // Costruisci i line items per Stripe
    const lineItems = items.map((cartItem: { productId: string; quantity: number; size?: string }) => {
      const product = products.find((p) => p.id === cartItem.productId)
      if (!product) {
        throw new Error(`Prodotto ${cartItem.productId} non trovato`)
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name + (cartItem.size ? ` - Taglia ${cartItem.size}` : ''),
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(Number(product.price) * 100), // Stripe usa i centesimi
        },
        quantity: cartItem.quantity,
      }
    })

    // Crea la sessione Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      // Raccolta indirizzo di spedizione
      shipping_address_collection: {
        allowed_countries: ['IT', 'DE', 'FR', 'ES', 'AT', 'BE', 'NL', 'CH', 'GB'],
      },
      // Opzioni di spedizione
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500, // 5.00 EUR
              currency: 'eur',
            },
            display_name: 'Spedizione Standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // 10.00 EUR
              currency: 'eur',
            },
            display_name: 'Spedizione Express',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      // URL di redirect
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      // Metadata per tracciamento ordine
      metadata: {
        order_items: JSON.stringify(items),
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
