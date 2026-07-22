"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Banknote, CreditCard, LoaderCircle, LockKeyhole, Mail, RefreshCw, ShoppingBag, UserPlus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { createCashOnDeliveryOrder, createCheckoutSession } from "@/app/actions/stripe"
import { getGoogleReviewStorageKey } from "@/lib/google-customer-reviews"
import { createClient } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CheckoutPage() {
  const { items, getTotal, clearCart, hydrated } = useCart()
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestCheckoutReady, setGuestCheckoutReady] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash_on_delivery">("card")
  const [cashDetails, setCashDetails] = useState({ name: "", address: "", city: "", postalCode: "" })
  const [cashError, setCashError] = useState<string | null>(null)
  const [cashSubmitting, setCashSubmitting] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
const [cardLoading, setCardLoading] = useState(false)
const [cardAttempt, setCardAttempt] = useState(0)
const sessionIdRef = useRef<string | null>(null)
const checkoutSessionRef = useRef<{ key: string; promise: Promise<string> } | null>(null)

  useEffect(() => {
    let active = true
    void createClient().auth.getSession().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.session))
    })

    return () => {
      active = false
    }
  }, [])

const cartLineItems = useMemo(() => items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
    lineId: item.lineId,
    customization: item.customization,
  })), [items])

  const checkoutKey = useMemo(
    () => JSON.stringify({ cartLineItems, email: isAuthenticated ? null : guestEmail.trim().toLowerCase() }),
    [cartLineItems, guestEmail, isAuthenticated]
  )

  const fetchClientSecret = useCallback(() => {
    if (checkoutSessionRef.current?.key === checkoutKey) {
      return checkoutSessionRef.current.promise
    }

    setCardError(null)
    setCardLoading(true)
    const promise = createCheckoutSession(cartLineItems, isAuthenticated ? undefined : guestEmail)
      .then((session) => {
        if (!session?.clientSecret) throw new Error(t.checkout.error)

        sessionIdRef.current = session.sessionId
        return session.clientSecret
      })
      .catch((error) => {
        checkoutSessionRef.current = null
        const message = error instanceof Error ? error.message : t.checkout.error
        setCardError(message)
        throw error
      })
      .finally(() => setCardLoading(false))

    checkoutSessionRef.current = { key: checkoutKey, promise }
    return promise
  }, [cartLineItems, checkoutKey, guestEmail, isAuthenticated, t.checkout.error])

  const retryCardCheckout = () => {
    checkoutSessionRef.current = null
    sessionIdRef.current = null
    setCardError(null)
    setCardAttempt((attempt) => attempt + 1)
  }
  const beginGuestCheckout = () => {
    if (!emailPattern.test(guestEmail.trim())) {
      setGuestError("Inserisci un indirizzo email valido per ricevere la conferma ordine.")
      return
    }

    setGuestError(null)
    setGuestCheckoutReady(true)
  }

  const completeCashOnDelivery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCashError(null)
    setCashSubmitting(true)

    try {
      const order = await createCashOnDeliveryOrder(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          lineId: item.lineId,
          customization: item.customization,
        })),
        {
          guestEmail: isAuthenticated ? undefined : guestEmail,
          ...cashDetails,
          country: "IT",
        }
      )

      try {
        window.sessionStorage.setItem(
          getGoogleReviewStorageKey(order.orderId),
          JSON.stringify(order.review),
        )
      } catch {
        // L'ordine resta valido anche se il browser blocca lo storage.
      }

      clearCart()
      window.location.assign(`/success?payment_method=cash_on_delivery&order_id=${encodeURIComponent(order.orderId)}`)
    } catch (error) {
      setCashError(error instanceof Error ? error.message : "Non e stato possibile registrare l ordine")
      setCashSubmitting(false)
    }
  }

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
        <Link href="/" className="inline-flex items-center gap-2 bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90">
          <ArrowLeft className="h-4 w-4" />
          {t.checkout.backToShop}
        </Link>
      </main>
    )
  }

  const accountSignUpHref = `/auth/sign-up?next=/checkout&email=${encodeURIComponent(guestEmail.trim())}`

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
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

        {!isAuthenticated && !guestCheckoutReady ? (
          <section className="mx-auto max-w-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Acquisto come ospite</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Riceverai qui la conferma e gli aggiornamenti del tuo ordine.</p>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="guest-email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input
                id="guest-email"
                type="email"
                autoComplete="email"
                value={guestEmail}
                onChange={(event) => {
                  setGuestEmail(event.target.value)
                  setGuestError(null)
                }}
                placeholder="nome@esempio.com"
                className="mt-2 bg-secondary"
              />
            </div>

            <div className="mt-5 flex items-start gap-3">
              <Checkbox id="create-account" checked={createAccount} onCheckedChange={(checked) => setCreateAccount(checked === true)} />
              <Label htmlFor="create-account" className="cursor-pointer text-sm leading-5 text-foreground">
                Vuoi creare un account per vedere gli ordini dal tuo pannello?
              </Label>
            </div>

            {guestError && <p className="mt-4 text-sm text-destructive">{guestError}</p>}

            {createAccount ? (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">Crea il MIRAI PASS prima del pagamento: al ritorno troverai il carrello pronto.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href={accountSignUpHref} className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                    <UserPlus className="h-4 w-4" /> Crea account
                  </Link>
                  <Link href="/auth/login?redirectTo=/checkout" className="inline-flex items-center justify-center border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground">
                    Ho gia un account
                  </Link>
                </div>
              </div>
            ) : (
              <button type="button" onClick={beginGuestCheckout} className="mt-6 w-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90">
                Continua come ospite
              </button>
            )}
          </section>
        ) : (
          <>
            {!isAuthenticated && (
              <div className="mb-4 flex items-center justify-between border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <span>Acquisto come ospite: {guestEmail.trim()}</span>
                <button type="button" onClick={() => setGuestCheckoutReady(false)} className="text-xs font-bold uppercase tracking-widest text-primary">Modifica</button>
              </div>
            )}
            <section className="mb-4 border border-border bg-card p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metodo di pagamento</p>
              <div className="mt-3 grid grid-cols-2 border border-border" role="radiogroup" aria-label="Metodo di pagamento">
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  className={`flex min-h-12 items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-widest transition-colors ${paymentMethod === "card" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                >
                  <CreditCard className="h-4 w-4" /> Carta
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "cash_on_delivery"}
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                  className={`flex min-h-12 items-center justify-center gap-2 border-l border-border px-3 text-xs font-bold uppercase tracking-widest transition-colors ${paymentMethod === "cash_on_delivery" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                >
                  <Banknote className="h-4 w-4" /> Contrassegno
                </button>
              </div>
            </section>

            {paymentMethod === "card" ? (
<section className="border border-border bg-card p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="font-semibold text-foreground">Pagamento sicuro con carta</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Continua sul checkout protetto di Stripe per inserire i dati della carta e l'indirizzo di spedizione.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-primary" />
                  <span>I dati della carta vengono gestiti direttamente da Stripe e non passano da MIRAI.</span>
                </div>

                <div className="relative min-h-[400px] border border-border bg-card p-1 mt-6">
                  {!stripePromise ? (
                    <div className="flex min-h-[398px] flex-col items-center justify-center px-6 text-center" role="alert">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <h2 className="mt-4 font-semibold text-foreground">Pagamento con carta non disponibile</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">La chiave pubblica Stripe non è configurata. Puoi scegliere il contrassegno oppure contattare l'assistenza.</p>
                    </div>
                  ) : (
                    <EmbeddedCheckoutProvider
                      key={`${checkoutKey}:${cardAttempt}`}
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
                  )}

                  {cardLoading && !cardError && stripePromise && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-card/95 px-4 py-3 text-sm text-muted-foreground" role="status">
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Preparazione pagamento sicuro...
                    </div>
                  )}

                  {cardError && (
                    <div className="absolute inset-x-4 top-4 z-10 border border-destructive/40 bg-background p-4 shadow-lg" role="alert">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">Impossibile caricare il pagamento</p>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">{cardError}</p>
                        </div>
                      </div>
                      <button type="button" onClick={retryCardCheckout} className="mt-4 inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                        <RefreshCw className="h-4 w-4" /> Riprova
                      </button>
                    </div>
                  )}
                </div>

              </section>
            ) : (
              <form onSubmit={completeCashOnDelivery} className="border border-border bg-card p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="font-semibold text-foreground">Pagamento alla consegna</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Pagherai al corriere quando riceverai il tuo ordine. Disponibile solo in Italia.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cash-name" className="text-xs uppercase tracking-widest text-muted-foreground">Nome e cognome</Label>
                    <Input id="cash-name" required autoComplete="name" value={cashDetails.name} onChange={(event) => setCashDetails((current) => ({ ...current, name: event.target.value }))} className="mt-2 bg-secondary" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cash-address" className="text-xs uppercase tracking-widest text-muted-foreground">Indirizzo</Label>
                    <Input id="cash-address" required autoComplete="street-address" value={cashDetails.address} onChange={(event) => setCashDetails((current) => ({ ...current, address: event.target.value }))} className="mt-2 bg-secondary" />
                  </div>
                  <div>
                    <Label htmlFor="cash-city" className="text-xs uppercase tracking-widest text-muted-foreground">Citta</Label>
                    <Input id="cash-city" required autoComplete="address-level2" value={cashDetails.city} onChange={(event) => setCashDetails((current) => ({ ...current, city: event.target.value }))} className="mt-2 bg-secondary" />
                  </div>
                  <div>
                    <Label htmlFor="cash-postal-code" className="text-xs uppercase tracking-widest text-muted-foreground">CAP</Label>
                    <Input id="cash-postal-code" required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" value={cashDetails.postalCode} onChange={(event) => setCashDetails((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "") }))} className="mt-2 bg-secondary" />
                  </div>
                </div>

                {cashError && <p className="mt-5 text-sm text-destructive" role="alert">{cashError}</p>}

                <button type="submit" disabled={cashSubmitting} className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                  <Banknote className="h-4 w-4" /> {cashSubmitting ? "Invio ordine..." : "Conferma ordine in contrassegno"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}
