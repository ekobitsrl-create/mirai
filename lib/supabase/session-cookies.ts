import type { NextResponse } from "next/server"

export function setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const options = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Keep expired JWTs available for renewal; Supabase validates their lifetime.
    maxAge: 60 * 60 * 24 * 30,
  }
  response.cookies.set("sb-access-token", accessToken, options)
  response.cookies.set("sb-refresh-token", refreshToken, options)
  response.headers.set("Cache-Control", "private, no-store")
}
