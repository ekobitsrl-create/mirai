import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server.js'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')
function compile(source, imports = {}, globals = {}) {
  const exports = {}
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } })
  vm.runInNewContext(outputText, { exports, require(name) {
    if (!(name in imports)) throw new Error(`Unexpected import ${name}`)
    return imports[name]
  }, URL, URLSearchParams, Headers, Buffer, process: { env: { NODE_ENV: 'production' } }, ...globals })
  return exports
}
const redirect = compile(await read('lib/auth-redirect.ts'))
const verifier = compile(await read('lib/supabase/verify-email-link.ts'))
const cookieHelpers = compile(await read('lib/supabase/session-cookies.ts'))
const proxySource = await read('proxy.ts')
const refreshSource = await read('lib/supabase/refresh-session.ts')
const confirmSource = await read('app/auth/confirm/page.tsx')
const session = { access_token: 'new-access-test', refresh_token: 'new-refresh-test' }
const flush = () => new Promise(resolve => setImmediate(resolve))

for (const path of ['//evil.example', '/\\evil.example', '/\t/evil.example', '/%5cevil.example', '/%2f/evil.example', 'https://evil.example', 'javascript:alert(1)', '/x/..//evil.example']) {
  test(`redirect rejects ${JSON.stringify(path)}`, () => {
    assert.equal(redirect.safeNextPath(path, '/account'), '/account')
  })
}
test('internal redirect preserves drop query and normalizes dot segments', () => {
  assert.equal(redirect.safeNextPath('/collezione/../collezione/drop?size=M#details'), '/collezione/drop?size=M#details')
})

for (const type of ['signup', 'magiclink', 'recovery']) {
  test(`verifies the supplied ${type} token without using an existing session`, async () => {
    let supplied
    const result = await verifier.verifyEmailLink({ verifyOtp: async value => {
      supplied = value; return { data: { session }, error: null }
    }, getSession: () => assert.fail('must not use existing session') }, new URL(`https://www.mirailabstore.com/auth/confirm?token_hash=test&type=${type}`))
    assert.equal(result, session)
    assert.equal(supplied.type, type)
    assert.equal(supplied.token_hash, 'test')
  })
}
for (const suffix of ['', '?token_hash=bad&type=unsupported', '#error=access_denied', '?error_code=otp_expired']) {
  test(`invalid callback cannot fall back to an existing session: ${suffix}`, async () => {
    await assert.rejects(verifier.verifyEmailLink({ getSession: () => assert.fail('existing session reused') }, new URL('https://www.mirailabstore.com/auth/confirm' + suffix)))
  })
}
test('legacy callback uses only the supplied token pair', async () => {
  let supplied
  await verifier.verifyEmailLink({ setSession: async value => { supplied = value; return { data: { session } } } }, new URL('https://www.mirailabstore.com/auth/confirm#access_token=explicit&refresh_token=explicit-refresh&type=recovery'))
  assert.equal(supplied.access_token, 'explicit')
})

function mountConfirmation({ verificationResult, save = async () => ({ ok: true }), type = 'signup' }) {
  let effect
  let calls = 0
  const states = []
  const timers = new Map()
  let nextTimer = 0
  const window = {
    location: { href: `https://www.mirailabstore.com/auth/confirm?token_hash=test&type=${type}&next=%2Fcollezione%2Fdrop` },
    history: { replaceState() {} },
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id },
    clearTimeout(id) { timers.delete(id) },
  }
  const component = compile(confirmSource, {
    'react/jsx-runtime': { jsx() {}, jsxs() {} }, 'next/link': {}, 'lucide-react': {},
    'react': { useState: value => [value, value => states.push(value)], useRef: value => ({ current: value }), useEffect: fn => { effect = fn } },
    '@/lib/supabase/client': { createClient: () => ({ auth: {} }) },
    '@/components/brand-mark': {}, '@/lib/auth-redirect': redirect,
    '@/lib/supabase/verify-email-link': { verifyEmailLink: () => { calls++; return verificationResult } },
  }, { window, fetch: save })
  component.default()
  return { effect: () => effect(), states, timers, window, calls: () => calls }
}
test('expired link never shows success or schedules navigation', async () => {
  let reject
  const page = mountConfirmation({ verificationResult: new Promise((_, no) => { reject = no }), save: () => assert.fail('must not save stale session') })
  page.effect(); reject(new Error('expired')); await flush()
  assert.ok(page.states.includes('error'))
  assert.ok(!page.states.includes('success'))
  assert.equal(page.timers.size, 0)
})
test('React effect replay verifies OTP once and recovery reaches password form', async () => {
  const page = mountConfirmation({ verificationResult: Promise.resolve(session), type: 'recovery' })
  const cleanup = page.effect(); cleanup(); const finalCleanup = page.effect(); await flush()
  assert.equal(page.calls(), 1)
  assert.equal(page.timers.size, 1)
  for (const fn of page.timers.values()) fn()
  assert.equal(page.window.location.href, '/auth/update-password')
  finalCleanup(); assert.equal(page.timers.size, 0)
})
test('session-save network failures show an error and do not redirect', async () => {
  const page = mountConfirmation({ verificationResult: Promise.resolve(session), save: async () => { throw new Error('offline') } })
  page.effect(); await flush()
  assert.ok(page.states.includes('error')); assert.equal(page.timers.size, 0)
})

function makeProxy(refresh) {
  return compile(proxySource, { 'next/server': { NextResponse }, '@/lib/supabase/refresh-session': { refreshServerSession: refresh }, '@/lib/supabase/session-cookies': cookieHelpers }).proxy
}
test('expired access cookie is restored before account redirect and forwarded to server render', async () => {
  const request = new NextRequest('https://www.mirailabstore.com/account', { headers: { cookie: 'sb-refresh-token=old-refresh-test' } })
  const response = await makeProxy(async (access, refresh) => {
    assert.equal(access, undefined); assert.equal(refresh, 'old-refresh-test'); return session
  })(request)
  assert.equal(response.status, 200)
  assert.equal(request.cookies.get('sb-access-token').value, session.access_token)
  assert.match(response.headers.get('x-middleware-request-cookie'), /sb-access-token=new-access-test/)
  assert.equal(response.cookies.get('sb-refresh-token').value, session.refresh_token)
  assert.equal(response.cookies.get('sb-access-token').httpOnly, true)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
})
test('anonymous protected request preserves its destination', async () => {
  const response = await makeProxy(async () => null)(new NextRequest('https://www.mirailabstore.com/account?view=orders'))
  const location = new URL(response.headers.get('location'))
  assert.equal(location.pathname, '/auth/login')
  assert.equal(location.searchParams.get('redirectTo'), '/account?view=orders')
})
test('drop request gets refreshed session and retains locale', async () => {
  const response = await makeProxy(async () => session)(new NextRequest('https://www.mirailabstore.com/en/collezione/drop'))
  assert.equal(response.headers.get('x-middleware-request-x-mirai-locale'), 'en')
  assert.match(response.headers.get('x-middleware-request-cookie'), /new-access-test/)
})
test('renewal skips live JWTs, refreshes expired tokens, and tolerates temporary errors', async () => {
  let calls = 0; let fail = false
  const { refreshServerSession } = compile(refreshSource, { '@supabase/supabase-js': { createClient: () => ({ auth: { refreshSession: async value => {
    calls++; assert.equal(value.refresh_token, 'refresh-test')
    if (fail) throw new Error('network')
    return { data: { session }, error: null }
  } } }) } })
  const token = exp => 'header.' + Buffer.from(JSON.stringify({ exp })).toString('base64url') + '.signature'
  assert.equal(await refreshServerSession(token(Date.now() / 1000 + 300), 'refresh-test'), null)
  assert.equal(calls, 0)
  assert.equal(await refreshServerSession(token(1), 'refresh-test'), session)
  assert.equal(await refreshServerSession(undefined, 'refresh-test'), session)
  fail = true
  assert.equal(await refreshServerSession('malformed', 'refresh-test'), null)
  assert.equal(calls, 3)
})
test('browser refresh outside Account synchronizes server cookies', async () => {
  let listener; const writes = []
  const { createClient } = compile(await read('lib/supabase/client.ts'), {
    '@supabase/supabase-js': { createClient: () => ({ auth: { onAuthStateChange: callback => { listener = callback } } }) },
  }, { process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-test' } }, fetch: async (url, options) => { writes.push({ url, ...options }); return { ok: true } } })
  assert.equal(createClient(), createClient())
  listener('TOKEN_REFRESHED', session); await flush()
  assert.equal(writes.length, 1)
  assert.equal(writes[0].url, '/api/auth/set-session')
  assert.equal(JSON.parse(writes[0].body).refresh_token, session.refresh_token)
})
for (const [path, type] of [['emails/supabase/confirm-signup.html', 'signup'], ['supabase/templates/confirmation.html', 'signup'], ['emails/supabase/magic-link.html', 'magiclink']]) {
  test(`${path} targets the explicit token callback`, async () => {
    const template = (await read(path)).replaceAll('{{ .TokenHash }}', 'hash-test').replaceAll('&amp;', '&')
    const url = new URL(template.match(/href="([^"]+)"/)[1])
    assert.equal(url.origin, 'https://www.mirailabstore.com')
    assert.equal(url.pathname, '/auth/confirm')
    assert.equal(url.searchParams.get('type'), type)
    assert.equal(url.searchParams.get('token_hash'), 'hash-test')
    assert.doesNotMatch(template, /ConfirmationURL|SiteURL|localhost/)
  })
}
