"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

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

export function GoogleIntegrations() {
  const pathname = usePathname()
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
    if (!hasAnalyticsConsent() || !window.gtag) return

    const pagePath = `${window.location.pathname}${window.location.search}`
    if (!force && lastTrackedPath.current === pagePath) return

    lastTrackedPath.current = pagePath
    window.gtag("event", "page_view", {
      send_to: GOOGLE_ANALYTICS_ID,
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
    })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasAnalyticsConsent() || !window.gtag) return

      // Ensure the saved consent update is queued before the first page view.
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      })
      trackPageView()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [pathname, trackPageView])

  useEffect(() => {
    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail

      if (consent === "all") {
        window.setTimeout(() => trackPageView(true), 0)
      } else {
        lastTrackedPath.current = null
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
        strategy="afterInteractive"
        onLoad={startMerchantWidget}
        onReady={startMerchantWidget}
      />
    </>
  )
}
