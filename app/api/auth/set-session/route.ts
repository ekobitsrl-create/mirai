import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { access_token, refresh_token } = await request.json()

  const response = NextResponse.json({ ok: true })

  // Store the auth tokens as cookies so the server can read them
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }

  response.cookies.set('sb-access-token', access_token, cookieOptions)
  response.cookies.set('sb-refresh-token', refresh_token, cookieOptions)

  return response
}
