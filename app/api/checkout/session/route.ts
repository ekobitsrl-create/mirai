import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { getServerUser } from '@/lib/supabase/server'

function formatAddress(address: Stripe.Address | null | undefined) {
  if (!address) return null

  return [address.line1, address.line2].filter(Boolean).join(', ') || null
}

export async function GET(request: NextRequest) {
  try {
    assertStripeConfigured()
    const user = await getServerUser()

    const sessionId = request.nextUrl.searchParams.get('session_id')
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Sessione ordine non valida' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const orderUserId = session.client_reference_id || session.metadata?.user_id
    if (orderUserId && orderUserId !== user?.id) {
      return NextResponse.json({ error: 'Ordine non disponibile' }, { status: 404 })
    }

    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pagamento in verifica' }, { status: 409 })
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    })
    const shippingDetails = session.collected_information?.shipping_details || session.shipping_details
    const shippingAddress = shippingDetails?.address

    return NextResponse.json({
      id: session.id,
      email: session.customer_details?.email || session.customer_email || user?.email || '',
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency || 'eur',
      shipping: shippingDetails
        ? {
            name: shippingDetails.name || null,
            address: formatAddress(shippingAddress),
            city: shippingAddress?.city || null,
            postalCode: shippingAddress?.postal_code || null,
            country: shippingAddress?.country || null,
          }
        : null,
      items: lineItems.data.map((item) => ({
        name: item.description,
        quantity: item.quantity || 0,
        amount: (item.amount_total || 0) / 100,
      })),
    })
  } catch (error) {
    console.error('Errore recupero conferma ordine:', error)
    return NextResponse.json({ error: 'Impossibile recuperare i dettagli dell ordine' }, { status: 500 })
  }
}
