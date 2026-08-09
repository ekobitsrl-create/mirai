import "server-only"

import { createHash } from "node:crypto"
import { cookies, headers } from "next/headers"
import { SITE_URL } from "@/lib/site-url"

type MetaPurchaseData = {
  content_ids: string[]
  content_type: "product"
  value: number
  currency: string
  contents?: Array<{ id: string; quantity: number; item_price?: number }>
  num_items?: number
}

function normalizedEmailHash(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase()
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return undefined
  return createHash("sha256").update(normalized).digest("hex")
}

export async function sendMetaPurchaseEvent(input: {
  eventId: string
  email?: string | null
  customData: MetaPurchaseData
}) {
  const datasetId = process.env.META_DATASET_ID?.trim()
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN?.trim()
  if (!datasetId || !/^\d{1,32}$/.test(datasetId) || !accessToken) return false

  const cookieStore = await cookies()
  if (cookieStore.get("cookie_consent")?.value !== "all") return false

  const headerStore = await headers()
  const forwardedIp = headerStore.get("x-vercel-forwarded-for")
    || headerStore.get("x-forwarded-for")
    || headerStore.get("cf-connecting-ip")
  const clientIp = forwardedIp?.split(",")[0]?.trim().slice(0, 64)
  const userAgent = headerStore.get("user-agent")?.trim().slice(0, 1_024)
  const emailHash = normalizedEmailHash(input.email)
  const fbp = cookieStore.get("_fbp")?.value.trim().slice(0, 255)
  const fbc = cookieStore.get("_fbc")?.value.trim().slice(0, 255)

  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${datasetId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1_000),
          event_id: input.eventId,
          event_source_url: `${SITE_URL}/success`,
          action_source: "website",
          user_data: {
            ...(clientIp ? { client_ip_address: clientIp } : {}),
            ...(userAgent ? { client_user_agent: userAgent } : {}),
            ...(emailHash ? { em: [emailHash] } : {}),
            ...(fbp ? { fbp } : {}),
            ...(fbc ? { fbc } : {}),
          },
          custom_data: input.customData,
        }],
        ...(process.env.META_TEST_EVENT_CODE?.trim()
          ? { test_event_code: process.env.META_TEST_EVENT_CODE.trim().slice(0, 100) }
          : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    })

    if (!response.ok) {
      console.warn("[meta-capi] Purchase non accettato", response.status)
      return false
    }
    return true
  } catch (error) {
    console.warn("[meta-capi] Purchase non inviato", error instanceof Error ? error.name : "unknown")
    return false
  }
}
