"use client"

import { getLoadedPostHogClient } from "@/lib/posthog-client"

export const TRACKING_CONSENT_EVENT = "mirai:cookie-consent"

export type TrackingConsent = "all" | "necessary" | null

type TrackerWindow = Window & {
  clarity?: ((command: string, value?: unknown) => void) & { q?: unknown[][] }
  fbq?: (...args: unknown[]) => void
  gtag?: (...args: unknown[]) => void
  ttq?: {
    revokeConsent?: () => void
  }
}

const TRACKING_COOKIE_PATTERN = /^(?:_ga(?:_.+)?|_gid|_gat(?:_.+)?|_gcl_.+|_fbp|_fbc|_clck|_clsk|ph_.+|posthog.+|ttclid|_ttp)$/i
const TRACKING_STORAGE_PATTERN = /^(?:ph_|posthog|_ga|_gid|_gcl_|_fbp|_fbc|_clck|_clsk|ttclid|_ttp)/i

export function getTrackingConsent(): TrackingConsent {
  if (typeof document === "undefined") return null

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("cookie_consent="))
    ?.split("=")[1]

  return value === "all" || value === "necessary" ? value : null
}

export function hasFullTrackingConsent() {
  return getTrackingConsent() === "all"
}

function expireCookie(name: string) {
  const hostname = window.location.hostname
  const domains = new Set<string | undefined>([undefined, hostname])

  if (hostname.startsWith("www.")) domains.add(hostname.slice(4))
  if (hostname.includes(".") && hostname !== "localhost") {
    domains.add(`.${hostname.replace(/^www\./, "")}`)
  }

  for (const domain of domains) {
    const domainAttribute = domain ? `; domain=${domain}` : ""
    document.cookie = `${name}=; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`
  }
}

function clearMatchingStorage(storage: Storage) {
  const keys: string[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key && TRACKING_STORAGE_PATTERN.test(key)) keys.push(key)
  }
  keys.forEach((key) => storage.removeItem(key))
}

export function purgeBrowserTrackingData() {
  if (typeof window === "undefined") return

  document.cookie
    .split("; ")
    .map((row) => row.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name && TRACKING_COOKIE_PATTERN.test(name)))
    .forEach(expireCookie)

  try {
    clearMatchingStorage(window.localStorage)
  } catch {
    // Storage can be unavailable in private/in-app browsers.
  }

  try {
    clearMatchingStorage(window.sessionStorage)
  } catch {
    // Storage can be unavailable in private/in-app browsers.
  }
}

export function revokeLoadedTrackers() {
  if (typeof window === "undefined") return

  const trackerWindow = window as TrackerWindow

  trackerWindow.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })

  trackerWindow.clarity?.("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "denied",
  })
  trackerWindow.clarity?.("consent", false)
  trackerWindow.fbq?.("consent", "revoke")
  trackerWindow.ttq?.revokeConsent?.()

  const posthog = getLoadedPostHogClient()
  if (posthog?.__loaded) {
    posthog.stopSessionRecording()
    posthog.reset(true)
  }

  purgeBrowserTrackingData()

  // Keep only PostHog's opt-out marker after removing its previous identity.
  if (posthog?.__loaded) posthog.opt_out_capturing()
}
