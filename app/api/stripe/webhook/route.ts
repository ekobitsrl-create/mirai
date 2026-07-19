import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function activeProduct(product: string | Stripe.Product | Stripe.DeletedProduct | null): Stripe.Product | null {
  if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) {
    return null
  }

  return product
}

function shippingAddress(session: Stripe.Checkout.Session) {
  const details = session.collected_information?.shipping_details || session.shipping_details
  const address = details?.address

  return {
    name: details?.name || null,
    address: [address?.line1, address?.line2].filter(Boolean).join(', ') || null,
    city: address?.city || null,
    zip: address?.postal_code || null,
    country: address?.country || null,
  }
}

async function saveOrder(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.user_id

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY non configurata')
  }

  const supabase = await createClient()
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existingOrderError) throw existingOrderError
  if (existingOrder) return

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  })
  const shipping = shippingAddress(session)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId || null,
      email: session.customer_details?.email || session.customer_email || '',
      status: 'confirmed',
      total: (session.amount_total || 0) / 100,
      shipping_name: shipping.name,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_zip: shipping.zip,
      shipping_country: shipping.country,
      stripe_session_id: session.id,
    })
    .select('id')
    .single()

  if (orderError) {
    if (orderError.code === '23505') return
    throw orderError
  }

  const orderItems = lineItems.data.map((item) => {
    const product = activeProduct(item.price?.product || null)
    const metadata = product?.metadata || {}
    const quantity = item.quantity || 1

    return {
      order_id: order.id,
      product_id: metadata.product_id || null,
      product_name: item.description || product?.name || 'Prodotto MIRAI',
      product_image: product?.images?.[0] || null,
      size: metadata.size || null,
      quantity,
      price: (item.amount_total || 0) / 100 / quantity,
    }
  })

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook Stripe non configurato' }, { status: 400 })
  }

  try {
    assertStripeConfigured()
    const event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status === 'paid') {
        await saveOrder(session)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Errore webhook Stripe:', error)
    return NextResponse.json({ error: 'Webhook non elaborato' }, { status: 400 })
  }
}
