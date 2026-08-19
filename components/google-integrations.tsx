"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { sanitizedAnalyticsPath, sanitizedAnalyticsUrl } from "@/lib/safe-analytics-url"
import {
  hasFullTrackingConsent,
  TRACKING_CONSENT_EVENT,
} from "@/lib/tracking-consent"

const GOOGLE_ANALYTICS_ID = "G-CY0KQKG7VG"
const GOOGLE_ADS_ID = "AW-18327352851"
const GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID = 5824924831

type PendingPageView = {
  key: string
  location: string
  path: string
  title: string
  capturedAt: number
}

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
  const [enabled, setEnabled] = useState(false)
  const [googleTagReady, setGoogleTagReady] = useState(false)
  const merchantWidgetStarted = useRef(false)
  const pendingPageViews = useRef<PendingPageView[]>([])
  const trackedPageViews = useRef(new Set<string>())
  const pageViewSequence = useRef(0)
  const lastCapturedPageView = useRef<{ signature: string; capturedAt: number } | null>(null)

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

  const flushPendingPageViews = useCallback(() => {
    if (!enabled || !googleTagReady || !window.gtag || !hasFullTrackingConsent()) return

    const queuedPageViews = pendingPageViews.current.splice(0)
    for (const pageView of queuedPageViews) {
      if (trackedPageViews.current.has(pageView.key)) continue

      trackedPageViews.current.add(pageView.key)
      window.gtag("event", "page_view", {
        send_to: GOOGLE_ANALYTICS_ID,
        page_location: pageView.location,
        page_path: pageView.path,
        page_title: pageView.title,
        page_load_timestamp: new Date(pageView.capturedAt).toISOString(),
      })
    }
  }, [enabled, googleTagReady])

  const queueCurrentPageView = useCallback(() => {
    const safeUrl = sanitizedAnalyticsUrl(window.location.href)
    const pagePath = sanitizedAnalyticsPath(safeUrl)
    const signature = `${pagePath}|${safeUrl.search}`
    const now = Date.now()
    if (
      lastCapturedPageView.current?.signature === signature
      && now - lastCapturedPageView.current.capturedAt < 1_000
    ) return

    const isInitialPageLoad = pageViewSequence.current === 0
    pageViewSequence.current += 1
    const capturedAt = isInitialPageLoad
      ? Math.round(window.performance.timeOrigin || now)
      : now
    lastCapturedPageView.current = { signature, capturedAt: now }
    pendingPageViews.current.push({
      key: `${capturedAt}-${pageViewSequence.current}-${pagePath}`,
      location: safeUrl.toString(),
      path: pagePath,
      title: document.title,
      capturedAt,
    })
    if (pendingPageViews.current.length > 20) pendingPageViews.current.shift()
  }, [])

  useEffect(() => {
    queueCurrentPageView()
  }, [pathname, queueCurrentPageView])

  useEffect(() => {
    const hasConsent = hasFullTrackingConsent()
    setEnabled(hasConsent)
    if (hasConsent) updateGoogleConsent("all")
  }, [])

  useEffect(() => {
    flushPendingPageViews()
  }, [enabled, flushPendingPageViews, googleTagReady])

  useEffect(() => {
    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail
      updateGoogleConsent(consent)
      setEnabled(consent === "all")

      if (consent === "all" && pendingPageViews.current.length === 0) {
        queueCurrentPageView()
      } else if (consent === "necessary") {
        pendingPageViews.current = []
        trackedPageViews.current.clear()
        lastCapturedPageView.current = null
      }
    }

    window.addEventListener(TRACKING_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(TRACKING_CONSENT_EVENT, handleConsent)
  }, [queueCurrentPageView])

  return (
    <>
      {enabled ? (
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
        </>
      ) : null}
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
