import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// A non-empty build key lets Next.js analyze API routes without contacting Stripe.
// Requests still fail explicitly below when the real production key is missing.
export const stripe = new Stripe(stripeSecretKey || 'sk_test_mirai_build_placeholder')

export function assertStripeConfigured() {
  if (!stripeSecretKey) {
    throw new Error('Stripe non configurato: aggiungi STRIPE_SECRET_KEY alle variabili ambiente')
  }
}
