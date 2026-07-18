"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="))
    let timer: ReturnType<typeof setTimeout> | undefined

    if (consent === "cookie_consent=all") {
      updateGoogleConsent("all")
    } else if (consent === "cookie_consent=necessary") {
      updateGoogleConsent("necessary")
    } else {
      // Small delay so it doesn't flash on load
      timer = setTimeout(() => setVisible(true), 1000)
    }

    const openSettings = () => setVisible(true)
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
    setVisible(false)
  }

  function acceptNecessary() {
    const hadMarketingConsent = document.cookie
      .split("; ")
      .some((row) => row === "cookie_consent=all")

    document.cookie = "cookie_consent=necessary; path=/; max-age=31536000; SameSite=Lax"
    updateGoogleConsent("necessary")
    window.dispatchEvent(new CustomEvent("mirai:cookie-consent", { detail: "necessary" }))
    setVisible(false)

    if (hadMarketingConsent) window.location.reload()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-fade-up">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-6 shadow-2xl shadow-background/80">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3
              className="text-sm font-bold tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {t.cookies.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptAll}
              className="h-10 px-6 bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t.cookies.acceptAll}
            </button>
            <button
              onClick={acceptNecessary}
              className="h-10 px-6 border border-border text-foreground font-medium text-sm tracking-wide uppercase rounded-lg hover:bg-secondary transition-colors"
            >
              {t.cookies.onlyNecessary}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
