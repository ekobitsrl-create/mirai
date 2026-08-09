"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

type GoogleConsentValue = "granted" | "denied"

function updateGoogleConsent(consent: "all" | "necessary") {
  const gtag = (window as Window & {
    gtag?: (...args: unknown[]) => void
  }).gtag

  const value: GoogleConsentValue = consent === "all" ? "granted" : "denied"

  gtag?.("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  })
}

function recordNecessaryOnlyChoice() {
  const endpoint = "/api/cookie-consent/decline"

  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(endpoint)
    return
  }

  void fetch(endpoint, {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {
    // The consent choice must still work if the anonymous counter is unavailable.
  })
}

export function CookieBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="))
    let timer: ReturnType<typeof setTimeout> | undefined

    if (consent === "cookie_consent=all") {
      setAnalyticsEnabled(true)
      setMarketingEnabled(true)
      updateGoogleConsent("all")
    } else if (consent === "cookie_consent=necessary") {
      updateGoogleConsent("necessary")
    } else {
      // Small delay so it doesn't flash on load
      timer = setTimeout(() => setVisible(true), 1000)
    }

    const openSettings = () => {
      const hasAllConsent = document.cookie
        .split("; ")
        .some((row) => row === "cookie_consent=all")

      setAnalyticsEnabled(hasAllConsent)
      setMarketingEnabled(hasAllConsent)
      setShowPreferences(false)
      setVisible(true)
    }
    window.addEventListener("mirai:open-cookie-settings", openSettings)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener("mirai:open-cookie-settings", openSettings)
    }
  }, [])

  function acceptAll() {
    document.cookie = "cookie_consent=all; path=/; max-age=31536000; SameSite=Lax"
    updateGoogleConsent("all")
    window.dispatchEvent(new CustomEvent("mirai:cookie-consent", { detail: "all" }))
    setAnalyticsEnabled(true)
    setMarketingEnabled(true)
    setShowPreferences(false)
    setVisible(false)
  }

  function acceptNecessary() {
    const currentConsent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="))
    const hadMarketingConsent = currentConsent === "cookie_consent=all"
    const shouldCountChoice = currentConsent !== "cookie_consent=necessary"

    document.cookie = "cookie_consent=necessary; path=/; max-age=31536000; SameSite=Lax"
    updateGoogleConsent("necessary")
    window.dispatchEvent(new CustomEvent("mirai:cookie-consent", { detail: "necessary" }))
    setAnalyticsEnabled(false)
    setMarketingEnabled(false)
    setShowPreferences(false)
    setVisible(false)

    if (shouldCountChoice) recordNecessaryOnlyChoice()

    if (hadMarketingConsent) window.location.reload()
  }

  function savePreferences() {
    if (analyticsEnabled && marketingEnabled) {
      acceptAll()
      return
    }

    acceptNecessary()
  }

  if (!visible) return null

  const isProductPage = pathname.startsWith("/prodotto/")

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[9999] px-2 pb-2 sm:p-4 animate-fade-up ${
        isProductPage
          ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-0"
          : "bottom-0"
      }`}
    >
      <div
        className={`pointer-events-auto relative mx-auto max-w-4xl overflow-y-auto bg-card border border-border rounded-xl p-3.5 sm:p-6 shadow-2xl shadow-background/80 ${
          showPreferences ? "max-h-[min(68dvh,32rem)]" : "max-h-[min(48dvh,22rem)]"
        }`}
      >
        <button
          type="button"
          onClick={acceptNecessary}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-10 w-10 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t.cookies.closeNecessary}
          title={t.cookies.closeNecessary}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 transition-colors hover:bg-secondary">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>

        <div className="flex flex-col gap-3 sm:gap-4">
          {showPreferences ? (
            <>
              <div className="flex flex-col gap-2 pr-12">
                <h3
                  className="text-sm font-bold tracking-widest uppercase text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {t.cookies.preferencesTitle}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.cookies.preferencesDescription}
                </p>
              </div>

              <div className="grid gap-3">
                <CookiePreferenceRow
                  title={t.cookies.necessary}
                  description={t.cookies.necessaryDescription}
                  activeLabel={t.cookies.alwaysActive}
                  enabled
                  locked
                />
                <CookiePreferenceRow
                  title={t.cookies.analytics}
                  description={t.cookies.analyticsDescription}
                  enabled={analyticsEnabled}
                  onToggle={() => setAnalyticsEnabled((enabled) => !enabled)}
                />
                <CookiePreferenceRow
                  title={t.cookies.marketing}
                  description={t.cookies.marketingDescription}
                  enabled={marketingEnabled}
                  onToggle={() => setMarketingEnabled((enabled) => !enabled)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={savePreferences}
                  className="min-h-11 px-3 sm:px-6 border border-border text-foreground font-medium text-[10px] sm:text-sm tracking-[0.08em] sm:tracking-wide uppercase rounded-lg hover:bg-secondary transition-colors"
                >
                  {t.cookies.savePreferences}
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-11 px-3 sm:px-6 bg-primary text-primary-foreground font-medium text-[10px] sm:text-sm tracking-[0.08em] sm:tracking-wide uppercase rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t.cookies.acceptAll}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 pr-12">
                <h3
                  className="text-sm font-bold tracking-widest uppercase text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {t.cookies.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed sm:hidden">
                  {t.cookies.compactDescription}{" "}
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    {t.cookies.cookiePolicy}
                  </Link>.
                </p>
                <p className="hidden text-sm text-muted-foreground leading-relaxed sm:block">
                  {t.cookies.description}{" "}
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    {t.cookies.cookiePolicy}
                  </Link>{" "}
                  {t.cookies.and}{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t.cookies.privacyPolicy}
                  </Link>.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-11 px-3 sm:px-6 bg-primary text-primary-foreground font-medium text-[10px] sm:text-sm tracking-[0.08em] sm:tracking-wide uppercase rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t.cookies.acceptAll}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="min-h-11 px-3 sm:px-6 border border-border text-foreground font-medium text-[10px] sm:text-sm tracking-[0.08em] sm:tracking-wide uppercase rounded-lg hover:bg-secondary transition-colors"
                >
                  {t.cookies.personalize}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type CookiePreferenceRowProps = {
  title: string
  description: string
  enabled: boolean
  locked?: boolean
  activeLabel?: string
  onToggle?: () => void
}

function CookiePreferenceRow({
  title,
  description,
  enabled,
  locked = false,
  activeLabel,
  onToggle,
}: CookiePreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/35 p-3 sm:gap-4 sm:p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {locked && activeLabel ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {activeLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        disabled={locked}
        onClick={onToggle}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          enabled
            ? "border-primary bg-primary"
            : "border-border bg-secondary"
        } ${locked ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  )
}
