"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import Link from "next/link"
import { ArrowLeft, LogIn, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { createCheckoutSession } from "@/app/actions/stripe"
import { createClient } from "@/lib/supabase/client"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { items, getTotal, clearCart, hydrated } = useCart()
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    void createClient().auth.getSession().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.session))
    })

    return () => {
      active = false
    }
  }, [])

  const fetchClientSecret = useCallback(async () => {
    const cartLineItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      lineId: item.lineId,
      customization: item.customization,
    }))
    const session = await createCheckoutSession(cartLineItems)
    if (!session?.clientSecret) {
      throw new Error(t.checkout.error)
    }

    sessionIdRef.current = session.sessionId
    return session.clientSecret
  }, [items, t.checkout.error])

  if (!hydrated || isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.checkout.emptyCart}</h1>
        <p className="text-muted-foreground mb-8">{t.checkout.emptyCartDesc}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.checkout.backToShop}
        </Link>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-md border border-border bg-card p-8 text-center">
          <LogIn className="mx-auto mb-5 h-11 w-11 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Completa con il tuo MIRAI PASS</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Crea un account o accedi per pagare e ritrovare ogni ordine nel tuo pannello personale.
          </p>
          <div className="mt-7 grid gap-3">
            <Link href="/auth/sign-up?next=/checkout" className="bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Crea MIRAI PASS
            </Link>
            <Link href="/auth/login?redirectTo=/checkout" className="border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground">
              Accedi
            </Link>
          </div>
        </section>
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
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.checkout.backToShop}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {t.checkout.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t.checkout.total}</p>
            <p className="text-2xl font-bold text-foreground">{"\u20AC"}{getTotal().toFixed(2)}</p>
          </div>
        </div>

        <div className="min-h-[400px] border border-border bg-card p-1">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              fetchClientSecret,
              onComplete: () => {
                clearCart()
                const sessionId = sessionIdRef.current
                window.location.assign(sessionId ? `/success?session_id=${encodeURIComponent(sessionId)}` : "/success")
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
