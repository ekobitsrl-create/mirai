"use client"

import { useEffect } from "react"
import {
  META_CONSENT_EVENT,
  META_PIXEL_READY_EVENT,
  trackMetaEvent,
  type MetaCommerceParameters,
  type MetaEventName,
} from "@/lib/meta-pixel"

type MetaPixelEventProps = {
  eventName: Exclude<MetaEventName, "PageView" | "AddToCart">
  parameters: MetaCommerceParameters
  eventId?: string
  dedupeKey?: string
}

export function MetaPixelEvent({
  eventName,
  parameters,
  eventId,
  dedupeKey,
}: MetaPixelEventProps) {
  const serializedParameters = JSON.stringify(parameters)

  useEffect(() => {
    let trackedThisMount = false

    const sendEvent = () => {
      if (trackedThisMount) return

      if (dedupeKey) {
        try {
          if (window.localStorage.getItem(dedupeKey) === "tracked") {
            trackedThisMount = true
            return
          }
        } catch {
          // Tracking still works when browser storage is unavailable.
        }
      }

      const tracked = trackMetaEvent(
        eventName,
        JSON.parse(serializedParameters) as MetaCommerceParameters,
        eventId,
      )
      if (!tracked) return

      trackedThisMount = true
      if (dedupeKey) {
        try {
          window.localStorage.setItem(dedupeKey, "tracked")
        } catch {
          // The in-memory guard still prevents duplicates for this mount.
        }
      }
    }

    const handleConsent = (event: Event) => {
      if ((event as CustomEvent<"all" | "necessary">).detail === "all") {
        window.setTimeout(sendEvent, 0)
      }
    }

    sendEvent()
    window.addEventListener(META_CONSENT_EVENT, handleConsent)
    window.addEventListener(META_PIXEL_READY_EVENT, sendEvent)
    return () => {
      window.removeEventListener(META_CONSENT_EVENT, handleConsent)
      window.removeEventListener(META_PIXEL_READY_EVENT, sendEvent)
    }
  }, [dedupeKey, eventId, eventName, serializedParameters])

  return null
}
