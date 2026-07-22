"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Banknote, CreditCard, LoaderCircle, LockKeyhole, Mail, ShoppingBag, UserPlus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { createCashOnDeliveryOrder, createCheckoutSession } from "@/app/actions/stripe"
import { createClient } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [cardSubmitting, setCardSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    void createClient().auth.getSession().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.session))
    })

    return () => {
      active = false
    }
  }, [])

  const beginGuestCheckout = () => {
    if (!emailPattern.test(guestEmail.trim())) {
      setGuestError("Inserisci un indirizzo email valido per ricevere la conferma ordine.")
      return
    }

    setGuestError(null)
    setGuestCheckoutReady(true)
  }

  const beginCardCheckout = async () => {
    setCardError(null)
    setCardSubmitting(true)

    try {
      const session = await createCheckoutSession(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          lineId: item.lineId,
          customization: item.customization,
        })),
        isAuthenticated ? undefined : guestEmail
      )

      if (!session?.checkoutUrl) {
        throw new Error(t.checkout.error)
      }

      window.location.assign(session.checkoutUrl)
    } catch (error) {
      setCardError(error instanceof Error ? error.message : t.checkout.error)
      setCardSubmitting(false)
    }
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

                {cardError && (
                  <div className="mt-5 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                    {cardError}. Riprova tra qualche istante oppure scegli il contrassegno.
                  </div>
                )}

                <button
                  type="button"
                  onClick={beginCardCheckout}
                  disabled={cardSubmitting}
                  className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cardSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  {cardSubmitting ? "Apertura pagamento..." : "Paga con carta"}
                </button>
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
