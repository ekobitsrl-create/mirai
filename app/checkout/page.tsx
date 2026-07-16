"use client"

import { useCallback, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { createCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const { t } = useLanguage()
  const [checkoutStarted, setCheckoutStarted] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    const cartLineItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      lineId: item.lineId,
      customization: item.customization,
    }))
    const clientSecret = await createCheckoutSession(cartLineItems)
    if (!clientSecret) {
      throw new Error(t.checkout.error)
    }
    return clientSecret
  }, [items, t.checkout.error])

  if (items.length === 0 && !checkoutStarted) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.checkout.emptyCart}</h1>
        <p className="text-muted-foreground mb-8">{t.checkout.emptyCartDesc}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.checkout.backToShop}
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.checkout.backToShop}
            </Link>
            <h1
              className="text-3xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {t.checkout.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t.checkout.total}</p>
            <p className="text-2xl font-bold text-foreground">
              {"\u20AC"}{getTotal().toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-sm border border-border p-1 min-h-[400px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              fetchClientSecret,
              onComplete: () => {
                clearCart()
                setCheckoutStarted(false)
              },
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </main>
  )
}
