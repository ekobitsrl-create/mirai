import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get("sb-access-token")?.value)

  if ((pathname.startsWith("/account") || pathname.startsWith("/admin")) && !hasSession) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.search = ""
    return NextResponse.redirect(loginUrl)
  }

  const localeMatch = pathname.match(/^\/(en|es|fr|de)(?:\/|$)/)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-mirai-locale", localeMatch?.[1] ?? "it")

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|favicon-32x32.png|apple-icon.png|robots.txt|sitemap.xml|google-merchant-feed(?:-[a-z]{2})?\\.xml).*)",
  ],
}
