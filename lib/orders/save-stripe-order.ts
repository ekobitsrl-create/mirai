import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { applyOrderInventory } from '@/lib/orders/apply-order-inventory'
import { recordDiscountUsage } from '@/lib/discounts'

function activeProduct(product: string | Stripe.Product | Stripe.DeletedProduct | null): Stripe.Product | null {
  if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) return null
  return product
}

function shippingAddress(session: Stripe.Checkout.Session) {
  const details = session.collected_information?.shipping_details || session.shipping_details
  const address = details?.address

  return {
    name: details?.name || null,
    phone: session.customer_details?.phone || null,
    address: [address?.line1, address?.line2].filter(Boolean).join(', ') || null,
    city: address?.city || null,
    zip: address?.postal_code || null,
    country: address?.country || null,
  }
}

function isMissingDiscountOrderColumns(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() || ""
  return error?.code === "PGRST204"
    && (message.includes("subtotal") || message.includes("discount_"))
}

export async function saveStripeOrder(session: Stripe.Checkout.Session) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY non configurata')
  }

  const supabase = createAdminClient()
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existingOrderError) throw existingOrderError
  if (existingOrder) {
    await applyOrderInventory(supabase, existingOrder.id)
    return existingOrder.id
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  })
  const shipping = shippingAddress(session)
  const userId = session.client_reference_id || session.metadata?.user_id
  const discountCode = session.metadata?.discount_code || null
  const discountType = session.metadata?.discount_type || null
  const discountValue = Number(session.metadata?.discount_value || 0)
  const discountAmountCents = Number(session.metadata?.discount_amount_cents || 0)
  const subtotalCents = Number(
    session.metadata?.subtotal_cents
    || session.amount_subtotal
    || session.amount_total
    || 0,
  )
  const shippingFeeCents = Number(
    session.total_details?.amount_shipping
    || session.metadata?.shipping_fee_cents
    || 0,
  )
  const baseOrderPayload = {
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
    notes: [
      'Pagamento online acquisito tramite Stripe',
      shippingFeeCents > 0 ? `Spedizione UE: €${(shippingFeeCents / 100).toFixed(2)}` : 'Spedizione Italia: gratuita',
      shipping.phone ? `Telefono: ${shipping.phone}` : null,
    ].filter(Boolean).join(' | '),
  }
  const discountAuditNote = discountCode
    ? `Codice sconto ${discountCode}: -€${(discountAmountCents / 100).toFixed(2)}`
    : null

  let orderResult = await supabase
    .from('orders')
    .insert({
      ...baseOrderPayload,
      subtotal: subtotalCents / 100,
      discount_code: discountCode,
      discount_type: discountType,
      discount_value: discountCode ? discountValue : null,
      discount_amount: discountAmountCents / 100,
    })
    .select('id')
    .single()

  if (orderResult.error && isMissingDiscountOrderColumns(orderResult.error)) {
    orderResult = await supabase
      .from('orders')
      .insert({
        ...baseOrderPayload,
        notes: [baseOrderPayload.notes, discountAuditNote].filter(Boolean).join(' | '),
      })
      .select('id')
      .single()
  }

  const { data: order, error: orderError } = orderResult
  if (orderError) {
    if (orderError.code === '23505') {
      const { data: concurrentOrder, error: concurrentOrderError } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single()

      if (concurrentOrderError) throw concurrentOrderError
      await applyOrderInventory(supabase, concurrentOrder.id)
      return concurrentOrder.id
    }
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
      is_preorder: metadata.is_preorder === 'true',
      preorder_release_at: metadata.preorder_release_at || null,
    }
  })

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }
  }

  await applyOrderInventory(supabase, order.id, { allowLegacyFallback: true })
  await recordDiscountUsage(supabase, discountCode)

  return order.id
}
