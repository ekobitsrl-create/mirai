import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// A non-empty build key lets Next.js analyze API routes without contacting Stripe.
// Requests still fail explicitly below when the real production key is missing.
export const stripe = new Stripe(stripeSecretKey || 'sk_test_mirai_build_placeholder')

export function assertStripeConfigured() {
  if (!stripeSecretKey) {
    throw new Error('Stripe non configurato: aggiungi STRIPE_SECRET_KEY alle variabili ambiente')
  }
}

export function assertStripeCheckoutConfigured() {
  assertStripeConfigured()

  if (!stripePublishableKey) {
    throw new Error('Stripe non configurato: aggiungi NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY alle variabili ambiente')
  }

  const secretMode = stripeSecretKey?.startsWith('sk_live_') ? 'live' : 'test'
  const publishableMode = stripePublishableKey.startsWith('pk_live_') ? 'live' : 'test'
  if (secretMode !== publishableMode) {
    throw new Error('Le chiavi Stripe pubblica e segreta appartengono a modalità diverse')
  }
}
