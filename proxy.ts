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

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
