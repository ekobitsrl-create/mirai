"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import Link from "next/link"
import { AlertCircle, ArrowLeft, BadgePercent, Banknote, Check, CreditCard, LoaderCircle, LockKeyhole, Mail, RefreshCw, ShoppingBag, UserPlus, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { createCashOnDeliveryOrder, createCheckoutSession, getCashOnDeliveryEligibility, validateCheckoutDiscount } from "@/app/actions/stripe"
import type { AppliedDiscount } from "@/lib/discounts"
import { getGoogleReviewStorageKey } from "@/lib/google-customer-reviews"
import { createClient } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CASH_ON_DELIVERY_FEE_CENTS } from "@/lib/checkout-fees"
import { MetaPixelEvent } from "@/components/meta-pixel-event"
import { buildMetaCartParameters, getMetaPurchaseStorageKey } from "@/lib/meta-pixel"
import { PostHogCommerceEvent } from "@/components/posthog-commerce-event"
import { getCatalogItemId } from "@/lib/catalog-identifiers"
import { formatLocalizedPrice, translateSiteText } from "@/lib/site-localization"
import {
  getShippingCostCents,
  isEuShippingCountry,
  SHIPPING_CONFIG,
  type EuCountryCode,
} from "@/lib/shipping"
import {
  parseQuickPaymentMethod,
  QUICK_PAYMENT_METHOD_QUERY_KEY,
  QUICK_PAYMENT_METHOD_STORAGE_KEY,
  type QuickPaymentMethod,
} from "@/lib/quick-payment"

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class CheckoutActionError extends Error {}

export default function CheckoutPage() {
  const { items, getTotal, clearCart, hydrated } = useCart()
  const { t, locale } = useLanguage()
  const ui = (source: string) => translateSiteText(source, locale)
  const money = (cents: number) => formatLocalizedPrice(cents / 100, locale)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [accountEmail, setAccountEmail] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestCheckoutReady, setGuestCheckoutReady] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash_on_delivery">("card")
  const [shippingCountry, setShippingCountry] = useState<EuCountryCode>("IT")
  const [cashOnDeliveryAvailable, setCashOnDeliveryAvailable] = useState(false)
  const [cashDetails, setCashDetails] = useState({ name: "", phone: "", address: "", city: "", postalCode: "" })
  const [cashError, setCashError] = useState<string | null>(null)
  const [cashSubmitting, setCashSubmitting] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [cardAttempt, setCardAttempt] = useState(0)
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [preferredQuickPaymentMethod, setPreferredQuickPaymentMethod] = useState<QuickPaymentMethod | null>(null)
  const [quickPaymentPreferenceReady, setQuickPaymentPreferenceReady] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const confirmationTokenRef = useRef<string | null>(null)
  const checkoutSessionRef = useRef<{ key: string; promise: Promise<string> } | null>(null)
  const clearCartRef = useRef(clearCart)

  useEffect(() => {
    clearCartRef.current = clearCart
  }, [clearCart])

  useEffect(() => {
    try {
      const queryMethod = new URLSearchParams(window.location.search).get(QUICK_PAYMENT_METHOD_QUERY_KEY)
      const storedMethod = window.sessionStorage.getItem(QUICK_PAYMENT_METHOD_STORAGE_KEY)
      setPreferredQuickPaymentMethod(
        parseQuickPaymentMethod(queryMethod) || parseQuickPaymentMethod(storedMethod),
      )
      window.sessionStorage.removeItem(QUICK_PAYMENT_METHOD_STORAGE_KEY)
    } catch {
      setPreferredQuickPaymentMethod(null)
    } finally {
      setQuickPaymentPreferenceReady(true)
    }
  }, [])

  const handleCardCheckoutComplete = useCallback(() => {
    clearCartRef.current()
    const sessionId = sessionIdRef.current
    const confirmationToken = confirmationTokenRef.current
    window.location.assign(
      sessionId && confirmationToken
        ? `/success?session_id=${encodeURIComponent(sessionId)}&confirmation_token=${encodeURIComponent(confirmationToken)}`
        : "/success",
    )
  }, [])

  useEffect(() => {
    let active = true

    const hydrateAuthentication = async () => {
      try {
        const { data, error } = await createClient().auth.getSession()
        if (error) throw error
        if (!active) return

        setIsAuthenticated(Boolean(data.session))
        setAccountEmail(data.session?.user.email?.trim().toLowerCase() || "")
      } catch (error) {
        console.error("Impossibile ripristinare la sessione utente nel checkout", error)
        if (!active) return

        setIsAuthenticated(false)
        setAccountEmail("")
      }
    }

    void hydrateAuthentication()

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

  useEffect(() => {
    let active = true

    if (!cartLineItems.length) {
      setCashOnDeliveryAvailable(false)
      return
    }

    getCashOnDeliveryEligibility(cartLineItems)
      .then((result) => {
        if (active) setCashOnDeliveryAvailable(result.eligible)
      })
      .catch(() => {
        if (active) setCashOnDeliveryAvailable(false)
      })

    return () => {
      active = false
    }
  }, [cartLineItems])

  useEffect(() => {
    if (!cashOnDeliveryAvailable && paymentMethod === "cash_on_delivery") {
      setPaymentMethod("card")
    }
  }, [cashOnDeliveryAvailable, paymentMethod])

  const hasAccountEmail = emailPattern.test(accountEmail)
  const requiresGuestEmail = !isAuthenticated || !hasAccountEmail
  const checkoutEmail = (requiresGuestEmail ? guestEmail : accountEmail).trim().toLowerCase()

  const checkoutKey = useMemo(
    () => JSON.stringify({
      cartLineItems,
      email: checkoutEmail,
      marketingConsent,
      discountCode: appliedDiscount?.code || "",
      shippingCountry,
      preferredQuickPaymentMethod,
    }),
    [appliedDiscount?.code, cartLineItems, checkoutEmail, marketingConsent, preferredQuickPaymentMethod, shippingCountry]
  )
  const countryDisplayNames = useMemo(
    () => typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([locale], { type: "region" }) : null,
    [locale],
  )

  const fetchClientSecret = useCallback(() => {
    if (checkoutSessionRef.current?.key === checkoutKey) return checkoutSessionRef.current.promise

    if (checkoutEmail && !emailPattern.test(checkoutEmail)) {
      const error = new Error("L'indirizzo email inserito non è valido.")
      setCardError(ui(error.message))
      return Promise.reject(error)
    }

    setCardError(null)
    setCardLoading(true)
    const promise = createCheckoutSession(
      cartLineItems,
      checkoutEmail,
      marketingConsent,
      sessionIdRef.current,
      appliedDiscount?.code,
      shippingCountry,
      preferredQuickPaymentMethod || undefined,
    )
      .then((result) => {
        if (!result.ok) throw new CheckoutActionError(result.error)
        const session = result.session
        if (!session?.clientSecret) throw new Error(t.checkout.error)
        sessionIdRef.current = session.sessionId
        confirmationTokenRef.current = session.confirmationToken
        return session.clientSecret
      })
      .catch((error) => {
        checkoutSessionRef.current = null
        const message = error instanceof CheckoutActionError ? error.message : t.checkout.error
        setCardError(ui(message))
        throw error
      })
      .finally(() => setCardLoading(false))

    checkoutSessionRef.current = { key: checkoutKey, promise }
    return promise
  }, [appliedDiscount?.code, cartLineItems, checkoutEmail, checkoutKey, marketingConsent, preferredQuickPaymentMethod, shippingCountry, t.checkout.error])

  const retryCardCheckout = () => {
    checkoutSessionRef.current = null
    sessionIdRef.current = null
    confirmationTokenRef.current = null
    setCardError(null)
    setCardAttempt((attempt) => attempt + 1)
  }

  const resetCardCheckout = () => {
    checkoutSessionRef.current = null
    sessionIdRef.current = null
    confirmationTokenRef.current = null
    setCardError(null)
    setCardAttempt((attempt) => attempt + 1)
  }

  const applyPromoCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPromoError(null)
    if (!emailPattern.test(checkoutEmail)) {
      setPromoError(ui("Inserisci prima un indirizzo email valido."))
      return
    }

    setPromoLoading(true)
    try {
      const result = await validateCheckoutDiscount(cartLineItems, checkoutEmail, promoCode)
      if (!result.ok) {
        setAppliedDiscount(null)
        setPromoError(ui(result.error))
        resetCardCheckout()
        return
      }
      const discount = result.discount
      setAppliedDiscount(discount)
      setPromoCode(discount.code)
      resetCardCheckout()
    } catch (error) {
      console.error("Impossibile verificare il codice sconto", error)
      setAppliedDiscount(null)
      setPromoError(ui("Non è stato possibile verificare il codice sconto. Riprova."))
      resetCardCheckout()
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromoCode = () => {
    setAppliedDiscount(null)
    setPromoCode("")
    setPromoError(null)
    resetCardCheckout()
  }

  const embeddedCheckoutOptions = useMemo(() => ({
    fetchClientSecret,
    onComplete: handleCardCheckoutComplete,
  }), [fetchClientSecret, handleCardCheckoutComplete])

  const beginGuestCheckout = () => {
    if (guestEmail.trim() && !emailPattern.test(guestEmail.trim())) {
      setGuestError(ui("L'indirizzo email inserito non è valido."))
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
          guestEmail: checkoutEmail,
          discountCode: appliedDiscount?.code,
          ...cashDetails,
          country: shippingCountry,
        }
      )

      try {
        window.sessionStorage.setItem(getGoogleReviewStorageKey(order.orderId), JSON.stringify(order.review))
        window.sessionStorage.setItem(getMetaPurchaseStorageKey(order.orderId), JSON.stringify(order.meta))
      } catch {}

      clearCart()
      const confirmationQuery = new URLSearchParams({
        payment_method: "cash_on_delivery",
        order_id: order.orderId,
        confirmation_token: order.confirmationToken,
      })
      window.location.assign(`/success?${confirmationQuery.toString()}`)
    } catch (error) {
      setCashError(error instanceof Error ? ui(error.message) : ui("Non è stato possibile registrare l'ordine"))
      setCashSubmitting(false)
    }
  }

  if (!hydrated || isAuthenticated === null || !quickPaymentPreferenceReady) {
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
  const discountedProductsTotalCents = appliedDiscount?.totalCents ?? Math.round(getTotal() * 100)
  const selectedPaymentFeeCents = paymentMethod === "cash_on_delivery" ? CASH_ON_DELIVERY_FEE_CENTS : 0
  const shippingFeeCents = getShippingCostCents(shippingCountry)
  const checkoutTotalCents = discountedProductsTotalCents + selectedPaymentFeeCents + shippingFeeCents
  const checkoutMetaParameters = buildMetaCartParameters(items, getTotal())

  return (
    <main className="min-h-screen bg-background">
      <MetaPixelEvent eventName="InitiateCheckout" parameters={checkoutMetaParameters} />
      <PostHogCommerceEvent
        eventName="begin_checkout"
        properties={{
          value: Number(getTotal().toFixed(2)),
          currency: "EUR",
          item_count: items.reduce((total, item) => total + item.quantity, 0),
          items: items.map((item) => ({
            product_id: item.metaContentId || getCatalogItemId({ id: item.productId }, item.size || "OS"),
            product_name: item.name,
            price: Number(item.price),
            currency: "EUR",
            quantity: item.quantity,
            size: item.size,
          })),
        }}
      />
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
            {appliedDiscount ? (
              <div>
                <p className="text-xs text-muted-foreground">
                  {ui("Subtotale")} <span className="line-through">{money(appliedDiscount.subtotalCents)}</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-400">
                  -{money(appliedDiscount.discountCents)} {ui("con")} {appliedDiscount.code}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{ui("Prodotti")} {formatLocalizedPrice(getTotal(), locale)}</p>
            )}
            {selectedPaymentFeeCents > 0 && (
              <p className="mt-1 text-xs font-semibold text-amber-400">
                {ui("Supplemento contrassegno")} +{money(selectedPaymentFeeCents)}
              </p>
            )}
            <p className={`mt-1 text-xs font-semibold ${shippingFeeCents > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {ui("Spedizione")} {shippingFeeCents > 0 ? `+${money(shippingFeeCents)}` : ui("gratuita")}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {money(checkoutTotalCents)}
            </p>
          </div>
        </div>

        {requiresGuestEmail && !guestCheckoutReady ? (
          <section className="mx-auto max-w-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Acquisto come ospite</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Puoi continuare senza email. Se la inserisci, riceverai la conferma e gli aggiornamenti dell'ordine.</p>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="guest-email" className="text-xs uppercase tracking-widest text-muted-foreground">Email (facoltativa)</Label>
              <Input
                id="guest-email"
                type="email"
                autoComplete="email"
                value={guestEmail}
                onChange={(event) => {
                  setGuestEmail(event.target.value)
                  if (!event.target.value.trim()) setMarketingConsent(false)
                  setGuestError(null)
                  if (appliedDiscount) {
                    setAppliedDiscount(null)
                    setPromoError(null)
                    resetCardCheckout()
                  }
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
            {requiresGuestEmail && (
              <div className="mb-4 flex flex-col gap-2 border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 break-all">{guestEmail.trim() ? `Acquisto come ospite: ${guestEmail.trim()}` : "Acquisto come ospite senza email"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setGuestCheckoutReady(false)
                    if (appliedDiscount) removePromoCode()
                  }}
                  className="shrink-0 self-end text-xs font-bold uppercase tracking-widest text-primary sm:self-auto"
                >
                  Modifica
                </button>
              </div>
            )}
            <section className="mb-4 border border-border bg-card p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <BadgePercent className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">Hai un codice sconto?</p>
                  <p className="mt-1 text-sm text-muted-foreground">MIRAI10 ti dà il 10% sul primo ordine, anche sui prodotti Minimal già a 29,90 €.</p>
                </div>
              </div>

              {appliedDiscount ? (
                <div className="mt-4 flex flex-col gap-3 border border-emerald-400/30 bg-emerald-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Codice {appliedDiscount.code} applicato</p>
                      <p className="text-xs text-emerald-400">Risparmi {"\u20AC"}{(appliedDiscount.discountCents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={removePromoCode} className="inline-flex min-h-9 items-center justify-center gap-2 border border-border px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                    <X className="h-3.5 w-3.5" /> Rimuovi
                  </button>
                </div>
              ) : (
                <form onSubmit={applyPromoCode} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Input
                    aria-label="Codice sconto"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value.toUpperCase())
                      setPromoError(null)
                    }}
                    placeholder="Inserisci il codice"
                    className="h-11 flex-1 bg-secondary uppercase tracking-widest"
                  />
                  <button type="submit" disabled={promoLoading || !promoCode.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                    {promoLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Applica
                  </button>
                </form>
              )}

              {promoError && <p className="mt-3 text-sm text-destructive" role="alert">{promoError}</p>}
            </section>

            <section className="mb-4 border border-border bg-card p-4 sm:p-5">
              <Label htmlFor="shipping-country" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {ui("Paese di spedizione")}
              </Label>
              <select
                id="shipping-country"
                name="shipping-country"
                autoComplete="country"
                value={shippingCountry}
                onChange={(event) => {
                  const countryCode = event.target.value
                  if (!isEuShippingCountry(countryCode)) return
                  setShippingCountry(countryCode)
                  resetCardCheckout()
                }}
                className="mt-3 min-h-12 w-full border border-border bg-secondary px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                {SHIPPING_CONFIG.allowedCountries.map((countryCode) => (
                  <option key={countryCode} value={countryCode}>
                    {countryDisplayNames?.of(countryCode) || countryCode}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {shippingCountry === "IT"
                  ? ui("Spedizione gratuita in Italia.")
                  : ui("Supplemento fisso di 40 € per le spedizioni negli altri Paesi dell'Unione Europea.")}
              </p>
            </section>

            <section className="mb-4 border border-border bg-card p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metodo di pagamento</p>
              <div className={`mt-3 grid border border-border ${cashOnDeliveryAvailable ? "grid-cols-2" : "grid-cols-1"}`} role="radiogroup" aria-label="Metodo di pagamento">
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  className={`flex min-h-12 items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-widest transition-colors ${paymentMethod === "card" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                >
                  <CreditCard className="h-4 w-4" /> Pagamento online
                </button>
                {cashOnDeliveryAvailable && (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "cash_on_delivery"}
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={`flex min-h-12 items-center justify-center gap-2 border-l border-border px-3 text-xs font-bold uppercase tracking-widest transition-colors ${paymentMethod === "cash_on_delivery" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                  >
                    <Banknote className="h-4 w-4" /> Contrassegno (+{"\u20AC"}9)
                  </button>
                )}
              </div>
              {!cashOnDeliveryAvailable && (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {ui("Il pagamento in contrassegno è disponibile solo per gli ordini che contengono esclusivamente prodotti del brand Minimal.")}
                </p>
              )}
              <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
                <Checkbox
                  id="marketing-consent"
                  checked={marketingConsent}
                  disabled={!emailPattern.test(checkoutEmail)}
                  onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                />
                <Label htmlFor="marketing-consent" className="cursor-pointer text-sm leading-5 text-muted-foreground">
                  Desidero ricevere promemoria sul carrello e novita MIRAI. Richiede un indirizzo email.
                </Label>
              </div>
            </section>

            {paymentMethod === "card" ? (
              <section className="border border-border bg-card p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="font-semibold text-foreground">Pagamento sicuro</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Scegli il metodo di pagamento disponibile nel checkout protetto di Stripe e completa i dati di spedizione.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-primary" />
                  <span>I dati di pagamento vengono gestiti direttamente da Stripe e non passano da MIRAI.</span>
                </div>

                <div className="relative min-h-[400px] border border-border bg-card p-1 mt-6">
                  {!stripePromise ? (
                    <div className="flex min-h-[398px] flex-col items-center justify-center px-6 text-center" role="alert">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <h2 className="mt-4 font-semibold text-foreground">Pagamento online non disponibile</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">La configurazione Stripe non è disponibile. Puoi scegliere il contrassegno oppure contattare l'assistenza.</p>
                    </div>
                  ) : (
                    <EmbeddedCheckoutProvider
                      key={`${checkoutKey}:${cardAttempt}`}
                      stripe={stripePromise}
                      options={embeddedCheckoutOptions}
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
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {ui("Pagherai al corriere quando riceverai il tuo ordine. Il totale include il supplemento fisso di 9 € per il contrassegno e, fuori dall'Italia, 40 € di spedizione UE.")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cash-name" className="text-xs uppercase tracking-widest text-muted-foreground">Nome e cognome</Label>
                    <Input id="cash-name" required autoComplete="name" value={cashDetails.name} onChange={(event) => setCashDetails((current) => ({ ...current, name: event.target.value }))} className="mt-2 bg-secondary" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cash-phone" className="text-xs uppercase tracking-widest text-muted-foreground">Numero di telefono</Label>
                    <Input id="cash-phone" type="tel" required inputMode="tel" autoComplete="tel" minLength={8} maxLength={24} placeholder="Es. +39 349 123 4567" value={cashDetails.phone} onChange={(event) => setCashDetails((current) => ({ ...current, phone: event.target.value }))} className="mt-2 bg-secondary" />
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
                    <Input id="cash-postal-code" required inputMode={shippingCountry === "IT" ? "numeric" : "text"} pattern={shippingCountry === "IT" ? "[0-9]{5}" : undefined} maxLength={16} autoComplete="postal-code" value={cashDetails.postalCode} onChange={(event) => setCashDetails((current) => ({ ...current, postalCode: shippingCountry === "IT" ? event.target.value.replace(/\D/g, "") : event.target.value }))} className="mt-2 bg-secondary" />
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
