"use client"

import { useEffect, useRef } from "react"
import {
  hasFullTrackingConsent,
  TRACKING_CONSENT_EVENT,
} from "@/lib/tracking-consent"

const GOOGLE_ADS_PURCHASE_DESTINATION = "AW-18327352851/jnIQCIfWrdIcEJPslKNE"
const SENT_STORAGE_PREFIX = "mirai:google-ads-purchase:"

export function GoogleAdsPurchaseConversion({ transactionId }: { transactionId: string }) {
  const sentTransactionId = useRef<string | null>(null)

  useEffect(() => {
    const normalizedTransactionId = transactionId.trim()
    if (!normalizedTransactionId || sentTransactionId.current === normalizedTransactionId) return

    const storageKey = `${SENT_STORAGE_PREFIX}${normalizedTransactionId}`
    try {
      if (window.sessionStorage.getItem(storageKey) === "sent") {
        sentTransactionId.current = normalizedTransactionId
        return
      }
    } catch {
      // Google deduplica comunque la conversione usando transaction_id.
    }

    let attempts = 0
    const sendConversion = () => {
      if (sentTransactionId.current === normalizedTransactionId) return true
      if (!hasFullTrackingConsent() || !window.gtag) return false

      window.gtag("event", "conversion", {
        send_to: GOOGLE_ADS_PURCHASE_DESTINATION,
        transaction_id: normalizedTransactionId,
      })
      sentTransactionId.current = normalizedTransactionId

      try {
        window.sessionStorage.setItem(storageKey, "sent")
      } catch {
        // Lo storage e solo una protezione locale aggiuntiva.
      }

      return true
    }

    if (sendConversion()) return

    const handleConsent = (event: Event) => {
      if ((event as CustomEvent<"all" | "necessary">).detail === "all") {
        window.setTimeout(sendConversion, 0)
      }
    }
    window.addEventListener(TRACKING_CONSENT_EVENT, handleConsent)

    const timer = window.setInterval(() => {
      attempts += 1
      if (sendConversion() || attempts >= 20) window.clearInterval(timer)
    }, 250)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener(TRACKING_CONSENT_EVENT, handleConsent)
    }
  }, [transactionId])

  return null
}
