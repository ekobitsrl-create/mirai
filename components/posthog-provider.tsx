"use client"

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  POSTHOG_CONSENT_EVENT,
  POSTHOG_READY_EVENT,
  hasPostHogConsent,
} from "@/lib/posthog-events"
import { getLoadedPostHogClient, loadPostHogClient } from "@/lib/posthog-client"
import { sanitizedAnalyticsUrl } from "@/lib/safe-analytics-url"

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() || ""
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || ""

let initializationStarted = false

async function initializePostHog(onReady: () => void) {
  if (!projectToken || !apiHost || typeof window === "undefined" || !hasPostHogConsent()) {
    return
  }

  const posthog = await loadPostHogClient()
  if (!hasPostHogConsent()) return

  if (posthog.__loaded) {
    posthog.opt_in_capturing()
    posthog.startSessionRecording()
    onReady()
    return
  }

  if (initializationStarted) return
  initializationStarted = true

  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    capture_heatmaps: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      blockSelector: "[data-ph-no-capture]",
      maskTextSelector: "[data-ph-mask]",
    },
    loaded: () => onReady(),
  })
}

function PostHogPageViews({ ready }: { ready: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrl = useRef<string | null>(null)

  useEffect(() => {
    const posthog = getLoadedPostHogClient()
    if (!ready || !posthog?.__loaded || !hasPostHogConsent()) return

    const currentUrl = sanitizedAnalyticsUrl(window.location.href).toString()
    if (lastTrackedUrl.current === currentUrl) return

    lastTrackedUrl.current = currentUrl
    posthog.capture("$pageview", { $current_url: currentUrl })
  }, [pathname, ready, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const markReady = () => {
      setReady(true)
      window.dispatchEvent(new CustomEvent(POSTHOG_READY_EVENT))
    }

    const handleConsent = (event: Event) => {
      const consent = (event as CustomEvent<"all" | "necessary">).detail

      if (consent === "all") {
        void initializePostHog(markReady)
        return
      }

      setReady(false)
      const posthog = getLoadedPostHogClient()
      if (posthog?.__loaded) {
        posthog.stopSessionRecording()
        posthog.opt_out_capturing()
      }
    }

    void initializePostHog(markReady)
    window.addEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageViews ready={ready} />
      </Suspense>
      {children}
    </>
  )
}
