"use client"

import { useEffect } from "react"
import {
  POSTHOG_CONSENT_EVENT,
  POSTHOG_READY_EVENT,
  trackPostHogEvent,
  type PostHogCommerceEventName,
  type PostHogCommerceProperties,
} from "@/lib/posthog-events"

type PostHogCommerceEventProps = {
  eventName: PostHogCommerceEventName
  properties: PostHogCommerceProperties
  dedupeKey?: string
}

export function PostHogCommerceEvent({
  eventName,
  properties,
  dedupeKey,
}: PostHogCommerceEventProps) {
  const serializedProperties = JSON.stringify(properties)

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
          // The in-memory guard still prevents duplicates for this mount.
        }
      }

      const tracked = trackPostHogEvent(
        eventName,
        JSON.parse(serializedProperties) as PostHogCommerceProperties,
      )
      if (!tracked) return

      trackedThisMount = true
      if (dedupeKey) {
        try {
          window.localStorage.setItem(dedupeKey, "tracked")
        } catch {
          // Tracking still works if browser storage is unavailable.
        }
      }
    }

    const handleConsent = (event: Event) => {
      if ((event as CustomEvent<"all" | "necessary">).detail === "all") {
        window.setTimeout(sendEvent, 0)
      }
    }

    sendEvent()
    window.addEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
    window.addEventListener(POSTHOG_READY_EVENT, sendEvent)
    return () => {
      window.removeEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
      window.removeEventListener(POSTHOG_READY_EVENT, sendEvent)
    }
  }, [dedupeKey, eventName, serializedProperties])

  return null
}
