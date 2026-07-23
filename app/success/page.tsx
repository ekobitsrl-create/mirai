"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useCart } from "@/lib/cart-context"
import { GoogleCustomerReviewsOptIn } from "@/components/google-customer-reviews-opt-in"
import {
  getGoogleReviewStorageKey,
  isGoogleCustomerReviewOrder,
  type GoogleCustomerReviewOrder,
} from "@/lib/google-customer-reviews"

type OrderSummary = {
  id: string
  email: string
  amountTotal: number
  currency: string
  estimatedDeliveryDate: string
  shipping: {
    name: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    country: string | null
  } | null
  items: Array<{ name: string; quantity: number; amount: number }>
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value)
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const paymentMethod = searchParams.get("payment_method")
  const orderId = searchParams.get("order_id")
  const isCashOnDelivery = paymentMethod === "cash_on_delivery"
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [reviewOrder, setReviewOrder] = useState<GoogleCustomerReviewOrder | null>(null)
  const [status, setStatus] = useState<"loading" | "pending" | "error" | "success" | "cash_on_delivery">("loading")

  useEffect(() => {
    if (isCashOnDelivery) {
      if (orderId) {
        try {
          const storageKey = getGoogleReviewStorageKey(orderId)
          const storedOrder = window.sessionStorage.getItem(storageKey)
          if (storedOrder) {
            const parsedOrder: unknown = JSON.parse(storedOrder)
            if (isGoogleCustomerReviewOrder(parsedOrder) && parsedOrder.orderId === orderId) {
              setReviewOrder(parsedOrder)
            }
            window.sessionStorage.removeItem(storageKey)
          }
        } catch {
          // La conferma resta disponibile se lo storage e bloccato o non valido.
        }
      }
      clearCart()
      setStatus("cash_on_delivery")
      return
    }

    if (!sessionId) {
      setStatus("error")
      return
    }

    let active = true
    void fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`, { credentials: "include" })
      .then(async (response) => {
        if (!active) return
        if (response.ok) {
          const summary = (await response.json()) as OrderSummary
          setOrder(summary)
          setStatus("success")
          clearCart()
          return
        }
        setStatus(response.status === 409 ? "pending" : "error")
      })
      .catch(() => {
        if (active) setStatus("error")
      })

    return () => {
      active = false
    }
  }, [clearCart, isCashOnDelivery, sessionId])

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (status === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-md border border-border bg-card p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 text-2xl font-bold text-foreground">Pagamento in verifica</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Stiamo ricevendo la conferma del pagamento. Aggiorna questa pagina tra qualche istante.
          </p>
          <Button className="mt-7 w-full" onClick={() => window.location.reload()}>
            Aggiorna stato
          </Button>
        </section>
      </main>
    )
  }

  if (status === "cash_on_delivery") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-md border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Ordine ricevuto</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Pagherai al corriere al momento della consegna. Il tuo ordine e ora in attesa di conferma.
          </p>
          {orderId && <p className="mt-5 font-mono text-sm text-foreground">#{orderId.slice(-8).toUpperCase()}</p>}
          {reviewOrder && <GoogleCustomerReviewsOptIn order={reviewOrder} />}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/account" className="inline-flex">
              <Button className="w-full">I miei ordini</Button>
            </Link>
            <Link href="/collezioni" className="inline-flex">
              <Button variant="outline" className="w-full">Continua</Button>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (status === "error" || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-md border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-5 text-2xl font-bold text-foreground">Ordine non disponibile</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Accedi con il MIRAI PASS usato per il pagamento per visualizzare la conferma e i tuoi ordini.
          </p>
          <Link href="/account" className="mt-7 inline-flex w-full">
            <Button className="w-full">Vai al mio account</Button>
          </Link>
        </section>
      </main>
    )
  }

  const shippingLine = [order.shipping?.postalCode, order.shipping?.city, order.shipping?.country]
    .filter(Boolean)
    .join(" ")

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      {order.email && order.shipping?.country && (
        <GoogleCustomerReviewsOptIn
          order={{
            orderId: order.id,
            email: order.email,
            deliveryCountry: order.shipping.country,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
          }}
        />
      )}
      <section className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Grazie per il tuo ordine
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            La conferma di pagamento e stata inviata a {order.email}. Prepariamo il tuo ordine e ti avviseremo alla spedizione.
          </p>
        </div>

        <div className="mt-10 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ordine</p>
              <p className="mt-1 font-mono text-sm text-foreground">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <p className="text-lg font-bold text-foreground">{formatPrice(order.amountTotal, order.currency)}</p>
          </div>

          <div className="divide-y divide-border px-6">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-6 py-4 text-sm">
                <p className="min-w-0 text-foreground">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></p>
                <p className="shrink-0 text-muted-foreground">{formatPrice(item.amount, order.currency)}</p>
              </div>
            ))}
          </div>

          {order.shipping && (
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Package className="h-4 w-4 text-primary" />
                Spedizione
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{order.shipping.name}</p>
              {order.shipping.address && <p className="text-sm text-muted-foreground">{order.shipping.address}</p>}
              {shippingLine && <p className="text-sm text-muted-foreground">{shippingLine}</p>}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/account" className="inline-flex">
            <Button className="w-full">I miei ordini <Package className="ml-2 h-4 w-4" /></Button>
          </Link>
          <Link href="/collezioni" className="inline-flex">
            <Button variant="outline" className="w-full">Continua lo shopping <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background"><Spinner className="h-8 w-8" /></main>}>
      <SuccessContent />
    </Suspense>
  )
}
