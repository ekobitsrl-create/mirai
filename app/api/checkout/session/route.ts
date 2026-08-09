import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { getServerUser } from '@/lib/supabase/server'
import { saveStripeOrder } from '@/lib/orders/save-stripe-order'
import { getEstimatedDeliveryDate } from '@/lib/google-customer-reviews'
import { SHIPPING_CONFIG } from '@/lib/shipping'
import { markCheckoutRecovered } from '@/lib/email/abandoned-cart'
import { sendOrderConfirmationEmail } from '@/lib/email/order-emails'
import {
  CHECKOUT_CONFIRMATION_METADATA_KEY,
  validCheckoutConfirmation,
} from '@/lib/checkout-confirmation'
import { consumeRateLimit } from '@/lib/request-security'
import { sendMetaPurchaseEvent } from '@/lib/meta-conversions-server'

function formatAddress(address: Stripe.Address | null | undefined) {
  if (!address) return null

  return [address.line1, address.line2].filter(Boolean).join(', ') || null
}

function activeProduct(product: string | Stripe.Product | Stripe.DeletedProduct | null): Stripe.Product | null {
  if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) return null
  return product
}

export async function GET(request: NextRequest) {
  try {
    if (!await consumeRateLimit({ bucket: 'checkout-confirmation', limit: 30, windowSeconds: 600, request })) {
      return NextResponse.json({ error: 'Troppe richieste' }, { status: 429 })
    }
    assertStripeConfigured()
    const user = await getServerUser()

    const sessionId = request.nextUrl.searchParams.get('session_id')
    const confirmationToken = request.nextUrl.searchParams.get('confirmation_token')
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Sessione ordine non valida' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const orderUserId = session.client_reference_id || session.metadata?.user_id
    const expectedConfirmationHash = session.metadata?.[CHECKOUT_CONFIRMATION_METADATA_KEY]
    const hasValidConfirmation = validCheckoutConfirmation(confirmationToken, expectedConfirmationHash)
    const legacyOwnedSession = !expectedConfirmationHash && Boolean(orderUserId && orderUserId === user?.id)
    if (!hasValidConfirmation && !legacyOwnedSession) {
      return NextResponse.json({ error: 'Ordine non disponibile' }, { status: 404 })
    }

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pagamento in verifica' }, { status: 409 })
    }

    try {
      const orderId = await saveStripeOrder(session)
      await markCheckoutRecovered({
        checkoutSessionId: session.id,
        email: session.customer_details?.email || session.customer_email,
      })
      await sendOrderConfirmationEmail(orderId, 'stripe')
    } catch (error) {
      console.error('Ordine pagato, sincronizzazione database rinviata al webhook:', error)
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    })
    const shippingDetails = session.collected_information?.shipping_details || session.shipping_details
    const shippingAddress = shippingDetails?.address
    const customerEmail = session.customer_details?.email || session.customer_email || user?.email || ''
    const items = lineItems.data.map((item) => {
      const product = activeProduct(item.price?.product || null)
      return {
        name: item.description,
        quantity: item.quantity || 0,
        amount: (item.amount_total || 0) / 100,
        contentId: product?.metadata.meta_content_id
          || product?.metadata.product_id
          || item.price?.id
          || item.id,
      }
    })

    await sendMetaPurchaseEvent({
      eventId: session.id,
      email: customerEmail,
      customData: {
        content_ids: [...new Set(items.map((item) => item.contentId))],
        content_type: 'product',
        value: (session.amount_total || 0) / 100,
        currency: (session.currency || 'eur').toUpperCase(),
        contents: items.map((item) => ({
          id: item.contentId,
          quantity: item.quantity,
          item_price: item.quantity > 0 ? item.amount / item.quantity : item.amount,
        })),
        num_items: items.reduce((total, item) => total + item.quantity, 0),
      },
    })

    return NextResponse.json({
      id: session.id,
      email: customerEmail,
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency || 'eur',
      estimatedDeliveryDate: getEstimatedDeliveryDate(
        SHIPPING_CONFIG.standardDeliveryDays.maximum,
        new Date(session.created * 1000),
      ),
      shipping: shippingDetails
        ? {
            name: shippingDetails.name || null,
            address: formatAddress(shippingAddress),
            city: shippingAddress?.city || null,
            postalCode: shippingAddress?.postal_code || null,
            country: shippingAddress?.country || null,
          }
        : null,
      items,
    }, { headers: { 'Cache-Control': 'no-store, private' } })
  } catch (error) {
    console.error('Errore recupero conferma ordine:', error)
    return NextResponse.json({ error: 'Impossibile recuperare i dettagli dell ordine' }, { status: 500 })
  }
}
