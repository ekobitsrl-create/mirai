import { NextResponse } from "next/server"
import { consumeRateLimit, isSameOriginRequest } from "@/lib/request-security"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
  }

  const hasNecessaryChoice = request.headers
    .get("cookie")
    ?.split(";")
    .some((cookie) => cookie.trim() === "cookie_consent=necessary")

  if (!hasNecessaryChoice) {
    return NextResponse.json({ error: "Consent choice missing" }, { status: 400 })
  }

  if (!await consumeRateLimit({ bucket: "cookie-decline", limit: 3, windowSeconds: 86_400, request })) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.rpc("increment_cookie_consent_necessary_count")

  if (error) {
    console.error("[cookie-consent] Anonymous counter increment failed", {
      code: error.code,
      message: error.message,
    })
    return NextResponse.json({ error: "Counter unavailable" }, { status: 503 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  })
}
