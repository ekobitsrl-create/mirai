import { NextRequest, NextResponse } from 'next/server'
import { isSameOriginRequest } from '@/lib/request-security'

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const response = NextResponse.json({ ok: true })

  response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 })
  response.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 })

  return response
}
