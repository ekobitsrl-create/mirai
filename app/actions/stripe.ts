'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { isBlackIslandProduct } from '@/lib/products'
import { getStripeShippingOptions, SHIPPING_CONFIG } from '@/lib/shipping'

type CartLineItem = {
  productId: string
  quantity: number
}

export async function createCheckoutSession(cartItems: CartLineItem[]) {
  if (!cartItems.length) {
    throw new Error('Il carrello è vuoto')
  }

  const supabase = await createClient()

  const productIds = cartItems.map((item) => item.productId)
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price')
    .in('id', productIds)

  if (error || !products) {
    throw new Error('Errore nel recupero dei prodotti')
  }

  if (products.some(isBlackIslandProduct)) {
    throw new Error('Uno dei prodotti selezionati non è più disponibile')
  }

  const lineItems = cartItems.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId)
    if (!product) {
      throw new Error(`Prodotto ${cartItem.productId} non trovato`)
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.name,
          description: product.description || undefined,
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: cartItem.quantity,
    }
  })

  const subtotalCents = lineItems.reduce(
    (total, item) => total + item.price_data.unit_amount * item.quantity,
    0
  )

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: lineItems,
    mode: 'payment',
    // Guest checkout: collect email and shipping without requiring an account
    customer_creation: 'always',
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_CONFIG.allowedCountries],
    },
    shipping_options: getStripeShippingOptions(subtotalCents),
  })

  return session.client_secret
}
