"use client"

import { Suspense, useEffect, useLayoutEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useCart } from "@/lib/cart-context"
import { GoogleCustomerReviewsOptIn } from "@/components/google-customer-reviews-opt-in"
import { GoogleAdsPurchaseConversion } from "@/components/google-ads-purchase-conversion"
import {
  getGoogleReviewStorageKey,
  isGoogleCustomerReviewOrder,
  type GoogleCustomerReviewOrder,
} from "@/lib/google-customer-reviews"
import { MetaPixelEvent } from "@/components/meta-pixel-event"
import {
  getMetaPurchaseStorageKey,
  isMetaCommerceParameters,
  type MetaCommerceParameters,
} from "@/lib/meta-pixel"
import { PostHogCommerceEvent } from "@/components/posthog-commerce-event"

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
  items: Array<{ name: string; quantity: number; amount: number; contentId: string }>
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
  const confirmationToken = searchParams.get("confirmation_token")
  const paymentMethod = searchParams.get("payment_method")
  const orderId = searchParams.get("order_id")
  const isCashOnDelivery = paymentMethod === "cash_on_delivery"
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [reviewOrder, setReviewOrder] = useState<GoogleCustomerReviewOrder | null>(null)
  const [cashPurchase, setCashPurchase] = useState<MetaCommerceParameters | null>(null)
  const [status, setStatus] = useState<"loading" | "pending" | "error" | "success" | "cash_on_delivery">("loading")

  useLayoutEffect(() => {
    if (window.location.search) window.history.replaceState(null, "", "/success")
  }, [])

  useEffect(() => {
    if (isCashOnDelivery) {
      if (!orderId || !confirmationToken) {
        setStatus("error")
        return
      }

      let active = true
      void fetch("/api/checkout/cash-confirmation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, confirmationToken }),
      })
        .then((response) => {
          if (!active) return
          if (!response.ok) {
            setStatus("error")
            return
          }

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

            const storedPurchase = window.sessionStorage.getItem(getMetaPurchaseStorageKey(orderId))
            if (storedPurchase) {
              const parsedPurchase: unknown = JSON.parse(storedPurchase)
              if (isMetaCommerceParameters(parsedPurchase)) {
                setCashPurchase(parsedPurchase)
              }
            }
          } catch {
            // La conferma resta disponibile se lo storage e bloccato o non valido.
          }

          clearCart()
          setStatus("cash_on_delivery")
        })
        .catch(() => {
          if (active) setStatus("error")
        })

      return () => {
        active = false
      }
    }

    if (!sessionId || !confirmationToken) {
      setStatus("error")
      return
    }

    let active = true
    const query = new URLSearchParams({
      session_id: sessionId,
      confirmation_token: confirmationToken,
    })
    void fetch(`/api/checkout/session?${query.toString()}`, { credentials: "include" })
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
  }, [clearCart, confirmationToken, isCashOnDelivery, orderId, sessionId])

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
        {orderId && <GoogleAdsPurchaseConversion transactionId={orderId} />}
        {orderId && cashPurchase && (
          <>
            <MetaPixelEvent
              eventName="Purchase"
              parameters={cashPurchase}
              eventId={orderId}
              dedupeKey={`mirai-meta-purchase-tracked:${orderId}`}
            />
            <PostHogCommerceEvent
              eventName="purchase"
              properties={{
                order_id: orderId,
                payment_method: "cash_on_delivery",
                value: cashPurchase.value,
                currency: cashPurchase.currency,
                item_count: cashPurchase.num_items,
                items: cashPurchase.contents?.map((item) => ({
                  product_id: item.id,
                  price: item.item_price,
                  currency: cashPurchase.currency,
                  quantity: item.quantity,
                })),
              }}
              dedupeKey={`mirai-posthog-purchase-tracked:${orderId}`}
            />
          </>
        )}
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
  const purchaseParameters: MetaCommerceParameters = {
    content_ids: [...new Set(order.items.map((item) => item.contentId))],
    content_type: "product",
    value: order.amountTotal,
    currency: order.currency.toUpperCase(),
    contents: order.items.map((item) => ({
      id: item.contentId,
      quantity: item.quantity,
      item_price: item.quantity > 0 ? item.amount / item.quantity : item.amount,
    })),
    num_items: order.items.reduce((total, item) => total + item.quantity, 0),
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <GoogleAdsPurchaseConversion transactionId={order.id} />
      <MetaPixelEvent
        eventName="Purchase"
        parameters={purchaseParameters}
        eventId={order.id}
        dedupeKey={`mirai-meta-purchase-tracked:${order.id}`}
      />
      <PostHogCommerceEvent
        eventName="purchase"
        properties={{
          order_id: order.id,
          payment_method: "card",
          value: order.amountTotal,
          currency: order.currency.toUpperCase(),
          item_count: order.items.reduce((total, item) => total + item.quantity, 0),
          items: order.items.map((item) => ({
            product_id: item.contentId,
            product_name: item.name,
            price: item.quantity > 0 ? item.amount / item.quantity : item.amount,
            currency: order.currency.toUpperCase(),
            quantity: item.quantity,
          })),
        }}
        dedupeKey={`mirai-posthog-purchase-tracked:${order.id}`}
      />
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
