"use client"

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as ReactPostHogProvider } from "posthog-js/react"
import {
  POSTHOG_CONSENT_EVENT,
  POSTHOG_READY_EVENT,
  hasPostHogConsent,
} from "@/lib/posthog-events"

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() || ""
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || ""

let initializationStarted = false

function initializePostHog(onReady: () => void) {
  if (!projectToken || !apiHost || typeof window === "undefined" || !hasPostHogConsent()) {
    return
  }

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
    if (!ready || !posthog.__loaded || !hasPostHogConsent()) return

    const query = searchParams.toString()
    const relativeUrl = query ? `${pathname}?${query}` : pathname
    const currentUrl = new URL(relativeUrl, window.location.origin).toString()
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
        initializePostHog(markReady)
        return
      }

      setReady(false)
      if (posthog.__loaded) {
        posthog.stopSessionRecording()
        posthog.opt_out_capturing()
      }
    }

    initializePostHog(markReady)
    window.addEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(POSTHOG_CONSENT_EVENT, handleConsent)
  }, [])

  return (
    <ReactPostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageViews ready={ready} />
      </Suspense>
      {children}
    </ReactPostHogProvider>
  )
}
