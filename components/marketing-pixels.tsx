"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  createMetaEventId,
  META_CONSENT_EVENT,
  META_PIXEL_ID,
  META_PIXEL_READY_EVENT,
  trackMetaEvent,
} from "@/lib/meta-pixel"
import { sanitizedAnalyticsPath, sanitizedAnalyticsUrl } from "@/lib/safe-analytics-url"

const GOOGLE_TAG_MANAGER_ID = "GTM-PRDL84CL"
const TIKTOK_PIXEL_ID = "D9BLKH3C77UBS5FSCEK0"

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
  const metaPageView = useRef<{ eventId: string; tracked: boolean; url: string } | null>(null)

  useEffect(() => {
    setEnabled(hasMarketingConsent())

    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail
      setEnabled(consent === "all")
    }

    window.addEventListener(META_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(META_CONSENT_EVENT, handleConsent)
  }, [])

  useEffect(() => {
    if (!enabled) {
      previousPath.current = null
      metaPageView.current = null
      return
    }

    const pageUrl = sanitizedAnalyticsUrl(window.location.href).toString()
    const pagePath = sanitizedAnalyticsPath(pageUrl)
    const isInitialPageView = previousPath.current === null
    const isNewPageView = previousPath.current !== pagePath

    if (isNewPageView) {
      previousPath.current = pagePath

      if (!isInitialPageView) {
        window.dataLayer?.push({
          event: "mirai_virtual_page_view",
          page_path: pagePath,
          page_title: document.title,
        })
        window.ttq?.page?.()
      }

      metaPageView.current = {
        eventId: createMetaEventId("PageView"),
        tracked: false,
        url: pageUrl,
      }
    }

    const sendMetaPageView = () => {
      const currentPageView = metaPageView.current
      if (!currentPageView || currentPageView.url !== pageUrl || currentPageView.tracked) return

      if (trackMetaEvent("PageView", undefined, currentPageView.eventId)) {
        currentPageView.tracked = true
      }
    }

    sendMetaPageView()
    window.addEventListener(META_PIXEL_READY_EVENT, sendMetaPageView)
    return () => window.removeEventListener(META_PIXEL_READY_EVENT, sendMetaPageView)
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

      {META_PIXEL_ID && (
        <Script id="mirai-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');
window.dispatchEvent(new Event('${META_PIXEL_READY_EVENT}'));`}
        </Script>
      )}

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
