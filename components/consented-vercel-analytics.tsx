"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import {
  hasFullTrackingConsent,
  TRACKING_CONSENT_EVENT,
} from "@/lib/tracking-consent"

export function ConsentedVercelAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasFullTrackingConsent())

    const handleConsent = (event: Event) => {
      setEnabled((event as CustomEvent<"all" | "necessary">).detail === "all")
    }

    window.addEventListener(TRACKING_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(TRACKING_CONSENT_EVENT, handleConsent)
  }, [])

  return enabled ? <Analytics /> : null
}
