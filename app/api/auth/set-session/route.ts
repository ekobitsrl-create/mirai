import { NextRequest, NextResponse } from "next/server"
import {
  consumeRateLimit,
  contentLengthWithin,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"
import { createPublicClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
  }
  if (!contentLengthWithin(request, 16 * 1024)) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
  }
  if (!await consumeRateLimit({ bucket: "auth-session", limit: 20, windowSeconds: 600, request })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let payload: { access_token?: unknown; refresh_token?: unknown }
  try {
    payload = await readJsonBody(request, 16 * 1024)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const accessToken = typeof payload.access_token === "string" ? payload.access_token.trim() : ""
  const refreshToken = typeof payload.refresh_token === "string" ? payload.refresh_token.trim() : ""
  if (!accessToken || !refreshToken || accessToken.length > 8192 || refreshToken.length > 8192) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 })
  }

  const supabase = createPublicClient()
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  const secure = process.env.NODE_ENV === "production"
  response.cookies.set("sb-access-token", accessToken, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60,
  })
  response.cookies.set("sb-refresh-token", refreshToken, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
