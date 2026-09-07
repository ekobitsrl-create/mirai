import { NextResponse, type NextRequest } from "next/server"
import { refreshServerSession } from "@/lib/supabase/refresh-session"
import { setSessionCookies } from "@/lib/supabase/session-cookies"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await refreshServerSession(
    request.cookies.get("sb-access-token")?.value,
    request.cookies.get("sb-refresh-token")?.value,
  )
  if (session) {
    // Forward renewed cookies to this render as well as back to the browser.
    request.cookies.set("sb-access-token", session.access_token)
    request.cookies.set("sb-refresh-token", session.refresh_token)
  }
  const hasSession = Boolean(request.cookies.get("sb-access-token")?.value)

  if ((pathname.startsWith("/account") || pathname.startsWith("/admin")) && !hasSession) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  const localeMatch = pathname.match(/^\/(en|es|fr|de)(?:\/|$)/)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-mirai-locale", localeMatch?.[1] ?? "it")

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  if (session) setSessionCookies(response, session.access_token, session.refresh_token)
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|favicon-32x32.png|apple-icon.png|robots.txt|sitemap.xml|google-merchant-feed(?:-[a-z]{2})?\\.xml).*)",
  ],
}
