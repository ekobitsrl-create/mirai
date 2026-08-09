import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { SITE_URL } from "@/lib/site-url"
import {
  consumeRateLimit,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 64 * 1024
const MAX_CONTENT_ITEMS = 100

const eventNameSchema = z.enum([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
])

const contentIdSchema = z.string().trim().min(1).max(200)

const customDataSchema = z.object({
  content_ids: z.array(contentIdSchema).max(MAX_CONTENT_ITEMS).optional(),
  content_type: z.literal("product").optional(),
  value: z.number().finite().min(0).max(100_000_000).optional(),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).optional(),
  contents: z.array(z.object({
    id: contentIdSchema,
    quantity: z.number().int().min(1).max(1_000),
    item_price: z.number().finite().min(0).max(100_000_000).optional(),
  }).strict()).max(MAX_CONTENT_ITEMS).optional(),
  num_items: z.number().int().min(0).max(100_000).optional(),
}).strict()

const eventSchema = z.object({
  event_name: eventNameSchema,
  event_id: z.string().trim().min(1).max(200),
  event_source_url: z.string().trim().min(1).max(2_048).url(),
  custom_data: customDataSchema.optional(),
}).strict()

function normalizeHostname(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "")
}

function getAllowedHostnames(request: NextRequest) {
  const hostnames = new Set<string>()

  const addHostname = (hostname: string) => {
    const normalized = normalizeHostname(hostname)
    if (normalized) hostnames.add(normalized)
  }

  addHostname(request.nextUrl.hostname)

  try {
    const siteHostname = new URL(SITE_URL).hostname
    addHostname(siteHostname)
    if (siteHostname.startsWith("www.")) {
      addHostname(siteHostname.slice(4))
    } else {
      addHostname(`www.${siteHostname}`)
    }
  } catch {
    // SITE_URL is normalized centrally; keep the request host if configuration is invalid.
  }

  return hostnames
}

function isAllowedEventSourceUrl(value: string, request: NextRequest) {
  try {
    const sourceUrl = new URL(value)
    if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") return false
    if (sourceUrl.username || sourceUrl.password) return false

    return getAllowedHostnames(request).has(normalizeHostname(sourceUrl.hostname))
  } catch {
    return false
  }
}

function getClientIp(request: NextRequest) {
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = request.headers.get("x-real-ip")?.trim()
  const clientIp = forwardedIp || realIp
  return clientIp ? clientIp.slice(0, 64) : undefined
}

function getLimitedValue(value: string | undefined, maximumLength: number) {
  const normalized = value?.trim()
  if (!normalized) return undefined
  return normalized.slice(0, maximumLength)
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine non valida." }, { status: 403 })
  }
  if (request.cookies.get("cookie_consent")?.value !== "all") {
    return NextResponse.json({ error: "Consenso marketing richiesto." }, { status: 403 })
  }
  if (!await consumeRateLimit({ bucket: "meta-events", limit: 120, windowSeconds: 600, request })) {
    return NextResponse.json({ error: "Troppe richieste." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await readJsonBody(request, MAX_BODY_BYTES)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Richiesta troppo grande." }, { status: 413 })
    }
    return NextResponse.json({ error: "JSON non valido." }, { status: 400 })
  }

  const parsedEvent = eventSchema.safeParse(body)
  if (!parsedEvent.success) {
    return NextResponse.json({ error: "Dati evento non validi." }, { status: 400 })
  }

  if (!isAllowedEventSourceUrl(parsedEvent.data.event_source_url, request)) {
    return NextResponse.json({ error: "Origine evento non consentita." }, { status: 400 })
  }

  const datasetId = process.env.META_DATASET_ID?.trim()
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN?.trim()
  if (!datasetId || !/^\d{1,32}$/.test(datasetId) || !accessToken) {
    return NextResponse.json({ error: "Meta Conversions API non configurata." }, { status: 503 })
  }

  const clientIp = getClientIp(request)
  const clientUserAgent = getLimitedValue(request.headers.get("user-agent") || undefined, 1_024)
  const fbp = getLimitedValue(request.cookies.get("_fbp")?.value, 255)
  const fbc = getLimitedValue(request.cookies.get("_fbc")?.value, 255)
  const userData = {
    ...(clientIp ? { client_ip_address: clientIp } : {}),
    ...(clientUserAgent ? { client_user_agent: clientUserAgent } : {}),
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  }

  const safeEventSourceUrl = new URL(parsedEvent.data.event_source_url)
  for (const key of ["session_id", "confirmation_token", "access_token", "refresh_token", "token", "code", "order_id"]) {
    safeEventSourceUrl.searchParams.delete(key)
  }
  safeEventSourceUrl.hash = ""

  const metaPayload = {
    data: [{
      event_name: parsedEvent.data.event_name,
      event_time: Math.floor(Date.now() / 1_000),
      event_id: parsedEvent.data.event_id,
      event_source_url: safeEventSourceUrl.toString(),
      action_source: "website" as const,
      user_data: userData,
      ...(parsedEvent.data.custom_data
        ? { custom_data: parsedEvent.data.custom_data }
        : {}),
    }],
    ...(process.env.META_TEST_EVENT_CODE?.trim()
      ? { test_event_code: process.env.META_TEST_EVENT_CODE.trim().slice(0, 100) }
      : {}),
  }

  const endpoint = `https://graph.facebook.com/v23.0/${datasetId}/events`

  try {
    const metaResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })

    if (!metaResponse.ok) {
      return NextResponse.json({ error: "Meta non ha accettato l'evento." }, { status: 502 })
    }

    return NextResponse.json({ accepted: true })
  } catch {
    return NextResponse.json({ error: "Meta non e raggiungibile." }, { status: 502 })
  }
}
