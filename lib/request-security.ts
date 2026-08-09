import "server-only"

import { createHmac } from "node:crypto"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"

type HeaderSource = Pick<Headers, "get">

function requestIdentifier(source: HeaderSource) {
  const forwarded = source.get("x-vercel-forwarded-for")
    || source.get("x-forwarded-for")
    || source.get("cf-connecting-ip")
    || "unknown"
  const ip = forwarded.split(",")[0]?.trim().slice(0, 80) || "unknown"
  const userAgent = source.get("user-agent")?.slice(0, 220) || "unknown"
  return `${ip}\n${userAgent}`
}

function rateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET?.trim()
    || process.env.CRON_SECRET?.trim()
    || process.env.SUPABASE_SECRET_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!secret) throw new Error("Rate limit secret non configurato")
  return secret
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return false

  const requestOrigin = new URL(request.url).origin
  return origin === requestOrigin || origin === SITE_URL
}

export function contentLengthWithin(request: Request, maximumBytes: number) {
  const rawLength = request.headers.get("content-length")
  if (!rawLength) return true
  const length = Number(rawLength)
  return Number.isFinite(length) && length >= 0 && length <= maximumBytes
}

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body too large")
    this.name = "RequestBodyTooLargeError"
  }
}

export async function readJsonBody<T = unknown>(request: Request, maximumBytes: number): Promise<T> {
  if (!contentLengthWithin(request, maximumBytes)) throw new RequestBodyTooLargeError()
  if (!request.body) throw new SyntaxError("Request body missing")

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maximumBytes) {
        await reader.cancel()
        throw new RequestBodyTooLargeError()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return JSON.parse(new TextDecoder().decode(body)) as T
}

export async function consumeRateLimit(input: {
  bucket: string
  limit: number
  windowSeconds: number
  request?: Request
}) {
  const source = input.request?.headers || await headers()
  const digest = createHmac("sha256", rateLimitSecret())
    .update(requestIdentifier(source))
    .digest("hex")

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_bucket: input.bucket,
    p_identifier_hash: digest,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  })

  if (error) {
    console.error("[rate-limit] Check failed", { bucket: input.bucket, code: error.code })
    return false
  }
  return data === true
}
