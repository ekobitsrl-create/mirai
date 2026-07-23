"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"

const GOOGLE_ANALYTICS_ID = "G-CY0KQKG7VG"
const GOOGLE_ADS_ID = "AW-18327352851"
const GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID = 5824924831

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

export function GoogleIntegrations() {
  const [mounted, setMounted] = useState(false)
  const merchantWidgetStarted = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

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
window.gtag('config', '${GOOGLE_ANALYTICS_ID}');
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
