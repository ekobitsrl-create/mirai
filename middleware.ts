import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase auth cookies
  const allCookies = request.cookies.getAll()
  const hasSession = allCookies.some(
    (c) => c.name.includes('sb-') || c.name.includes('auth-token')
  )

  // Protect /account and /admin
  if (
    (pathname.startsWith('/account') || pathname.startsWith('/admin')) &&
    !hasSession
  ) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
