"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { sanitizedAnalyticsPath, sanitizedAnalyticsUrl } from "@/lib/safe-analytics-url"

const GOOGLE_ANALYTICS_ID = "G-CY0KQKG7VG"
const GOOGLE_ADS_ID = "AW-18327352851"
const GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID = 5824924831
const COOKIE_CONSENT_EVENT = "mirai:cookie-consent"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    merchantwidget?: {
      start: (config: {
        merchant_id: number
        position: string
        region: string
        sideMargin: number
        bottomMargin: number
        mobileSideMargin: number
        mobileBottomMargin: number
      }) => void
    }
  }
}

function hasAnalyticsConsent() {
  return document.cookie
    .split("; ")
    .some((row) => row === "cookie_consent=all")
}

function updateGoogleConsent(consent: "all" | "necessary") {
  if (!window.gtag) return

  const value = consent === "all" ? "granted" : "denied"
  window.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  })
}

export function GoogleIntegrations() {
  const pathname = usePathname()
  const [googleTagReady, setGoogleTagReady] = useState(false)
  const merchantWidgetStarted = useRef(false)
  const lastTrackedPath = useRef<string | null>(null)

  const startMerchantWidget = useCallback(() => {
    if (merchantWidgetStarted.current || !window.merchantwidget) return

    merchantWidgetStarted.current = true
    window.merchantwidget.start({
      merchant_id: GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID,
      position: "LEFT_BOTTOM",
      region: "IT",
      sideMargin: 24,
      bottomMargin: 100,
      mobileSideMargin: 16,
      mobileBottomMargin: 96,
    })
  }, [])

  const trackPageView = useCallback((force = false) => {
    if (!googleTagReady || !window.gtag) return

    const safeUrl = sanitizedAnalyticsUrl(window.location.href)
    const pagePath = sanitizedAnalyticsPath(safeUrl)
    if (!force && lastTrackedPath.current === pagePath) return

    lastTrackedPath.current = pagePath
    window.gtag("event", "page_view", {
      send_to: GOOGLE_ANALYTICS_ID,
      page_location: safeUrl.toString(),
      page_path: pagePath,
      page_title: document.title,
    })
  }, [googleTagReady])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!googleTagReady || !window.gtag) return

      // Keep advanced Consent Mode active: consent is updated before the event,
      // while visitors without analytics consent only send a cookieless ping.
      updateGoogleConsent(hasAnalyticsConsent() ? "all" : "necessary")
      trackPageView()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [googleTagReady, pathname, trackPageView])

  useEffect(() => {
    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail

      updateGoogleConsent(consent)

      // If consent was chosen before gtag became ready, the readiness effect
      // will send the first page view. Never duplicate a page already measured.
      if (consent === "all" && lastTrackedPath.current === null) {
        window.setTimeout(() => trackPageView(), 0)
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent)
  }, [trackPageView])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
        onLoad={() => setGoogleTagReady(true)}
        onReady={() => setGoogleTagReady(true)}
      />
      <Script id="mirai-google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('js', new Date());
window.gtag('config', '${GOOGLE_ANALYTICS_ID}', { send_page_view: false });
window.gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
      <Script id="mirai-google-customer-reviews-language" strategy="afterInteractive">
        {`window.___gcfg = { lang: 'it' };`}
      </Script>
      <Script
        id="merchantWidgetScript"
        src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
        strategy="lazyOnload"
        onLoad={startMerchantWidget}
        onReady={startMerchantWidget}
      />
    </>
  )
}
