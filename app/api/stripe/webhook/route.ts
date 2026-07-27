import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { assertStripeConfigured, stripe } from '@/lib/stripe'
import { saveStripeOrder } from '@/lib/orders/save-stripe-order'
import { markCheckoutRecovered } from '@/lib/email/abandoned-cart'
import {
  sendCheckoutPaymentFailedEmail,
  sendOrderConfirmationEmail,
  sendPaymentIntentFailedEmail,
} from '@/lib/email/order-emails'

export const runtime = 'nodejs'

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
        const orderId = await saveStripeOrder(session)
        await markCheckoutRecovered({
          checkoutSessionId: session.id,
          email: session.customer_details?.email || session.customer_email,
        })
        await sendOrderConfirmationEmail(orderId, 'stripe')
      }
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      await sendCheckoutPaymentFailedEmail(event.data.object as Stripe.Checkout.Session)
    }

    if (event.type === 'payment_intent.payment_failed') {
      await sendPaymentIntentFailedEmail(event.data.object as Stripe.PaymentIntent)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Errore webhook Stripe:', error)
    return NextResponse.json({ error: 'Webhook non elaborato' }, { status: 400 })
  }
}
