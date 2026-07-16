"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const GOOGLE_TAG_MANAGER_ID = "GTM-PRDL84CL"
const TIKTOK_PIXEL_ID = "D9BLKH3C77UBS5FSCEK0"
const COOKIE_CONSENT_EVENT = "mirai:cookie-consent"

type TikTokQueue = unknown[] & {
  page?: () => void
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    ttq?: TikTokQueue
  }
}

function hasMarketingConsent() {
  return document.cookie
    .split("; ")
    .some((row) => row === "cookie_consent=all")
}

export function MarketingPixels() {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    setEnabled(hasMarketingConsent())

    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail
      setEnabled(consent === "all")
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent)
  }, [])

  useEffect(() => {
    if (!enabled) {
      previousPath.current = null
      return
    }

    const pagePath = `${pathname}${window.location.search}`

    if (previousPath.current === null) {
      previousPath.current = pagePath
      return
    }

    if (previousPath.current === pagePath) return
    previousPath.current = pagePath

    window.dataLayer?.push({
      event: "mirai_virtual_page_view",
      page_path: pagePath,
      page_title: document.title,
    })
    window.ttq?.page?.()
  }, [enabled, pathname])

  if (!enabled) return null

  return (
    <>
      <Script id="mirai-google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`}
      </Script>

      <Script id="mirai-tiktok-pixel" strategy="afterInteractive">
        {`!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

ttq.load('${TIKTOK_PIXEL_ID}');
ttq.page();
}(window, document, 'ttq');`}
      </Script>
    </>
  )
}
