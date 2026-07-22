import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

function activeProduct(product: string | Stripe.Product | Stripe.DeletedProduct | null): Stripe.Product | null {
  if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) return null
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

export async function saveStripeOrder(session: Stripe.Checkout.Session) {
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
  if (existingOrder) return existingOrder.id

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  })
  const shipping = shippingAddress(session)
  const userId = session.client_reference_id || session.metadata?.user_id
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
    if (orderError.code === '23505') return null
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
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }
  }

  return order.id
}
