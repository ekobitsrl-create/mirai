import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import { passwordRecoveryTemplate } from "@/lib/email/templates"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"

export const runtime = "nodejs"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 3

type RateLimitEntry = { count: number; resetAt: number }

const globalForPasswordRecovery = globalThis as typeof globalThis & {
  passwordRecoveryRateLimits?: Map<string, RateLimitEntry>
}

const rateLimits = globalForPasswordRecovery.passwordRecoveryRateLimits ?? new Map<string, RateLimitEntry>()
globalForPasswordRecovery.passwordRecoveryRateLimits = rateLimits

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown"
}

function isRateLimited(key: string) {
  const now = Date.now()
  const current = rateLimits.get(key)

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > MAX_REQUESTS_PER_WINDOW
}

function genericSuccess() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const requestOrigin = new URL(request.url).origin
  if (origin && origin !== requestOrigin && origin !== SITE_URL) {
    return NextResponse.json({ error: "Richiesta non consentita" }, { status: 403 })
  }

  if (Number(request.headers.get("content-length") || 0) > 2048) {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 413 })
  }

  let payload: { email?: unknown; website?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 })
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Inserisci un indirizzo email valido" }, { status: 400 })
  }

  // Honeypot: bots receive the same neutral response without generating a token.
  if (typeof payload.website === "string" && payload.website.trim()) return genericSuccess()

  const ip = clientIp(request)
  if (isRateLimited(`ip:${ip}`) || isRateLimited(`email:${email}`)) return genericSuccess()

  if ((!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) || !process.env.RESEND_API_KEY) {
    console.error("Recupero password non configurato: manca una credenziale server")
    return NextResponse.json({ error: "Servizio temporaneamente non disponibile" }, { status: 503 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    })

    const tokenHash = data.properties?.hashed_token
    if (error || !tokenHash) {
      // Do not reveal whether the address belongs to an account.
      if (error && error.code !== "user_not_found") {
        console.warn("Generazione link di recupero non riuscita", error.code || error.status)
      }
      return genericSuccess()
    }

    const resetUrl = new URL(getAbsoluteUrl("/auth/confirm"))
    resetUrl.searchParams.set("token_hash", tokenHash)
    resetUrl.searchParams.set("type", "recovery")

    const emailContent = passwordRecoveryTemplate(resetUrl.toString())
    await sendEmail({
      ...emailContent,
      to: email,
      category: "transactional",
      eventKey: `password-recovery-${crypto.randomUUID()}`,
    })
  } catch (error) {
    // Keep the public response neutral to prevent account enumeration.
    console.error("Invio recupero password non riuscito", error)
  }

  return genericSuccess()
}
