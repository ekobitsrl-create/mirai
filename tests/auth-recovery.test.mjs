import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import vm from "node:vm"
import test from "node:test"
import ts from "typescript"

const read = (path) => readFile(new URL(path, import.meta.url), "utf8")
const [routeSource, siteSource, templatesSource, hostedTemplate] = await Promise.all([
  read("../app/api/auth/reset-password/route.ts"),
  read("../lib/site-url.ts"),
  read("../lib/email/templates.ts"),
  read("../emails/supabase/reset-password.html"),
])

function compile(source, imports = {}, env = {}) {
  const exports = {}
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  })
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (!(name in imports)) throw new Error(`Unexpected import ${name}`)
      return imports[name]
    },
    process: { env }, URL, Response, crypto, console,
  })
  return exports
}

function setup(result) {
  const env = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000", SUPABASE_SERVICE_ROLE_KEY: "test-only", RESEND_API_KEY: "test-only" }
  const site = compile(siteSource, {}, env)
  const templates = compile(templatesSource, {
    "@/lib/site-url": site,
    "@/lib/checkout-fees": { CASH_ON_DELIVERY_FEE_EUROS: 0 },
    "@/lib/brand": { stylizeBrandText: (value) => value },
  })
  const deliveries = []
  const generated = []
  const route = compile(routeSource, {
    "next/server": { NextResponse: { json: Response.json } },
    "@/lib/supabase/server": {
      createAdminClient: () => ({ auth: { admin: { generateLink: async (input) => {
        generated.push(input)
        return result
      } } } }),
    },
    "@/lib/email/resend": { sendEmail: async (email) => { deliveries.push(email); return { sent: true } } },
    "@/lib/email/templates": templates,
    "@/lib/site-url": site,
  }, env)
  return { route, deliveries, generated }
}

function request() {
  return new Request("https://www.mirailabstore.com/api/auth/reset-password", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://www.mirailabstore.com" },
    body: JSON.stringify({ email: "member@example.invalid" }),
  })
}

test("recovery email uses the MIRAI token callback even if Supabase returns a localhost action link", async () => {
  const { route, deliveries, generated } = setup({ data: { properties: {
    hashed_token: "test-recovery-hash", action_link: "http://localhost:3000/#access_token=test-only",
  } }, error: null })
  const response = await route.POST(request())
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(deliveries.length, 1)
  assert.equal(generated[0].options.redirectTo, "https://www.mirailabstore.com/auth/confirm")
  const callback = new URL(deliveries[0].text.match(/https:\/\/\S+/)[0])
  assert.equal(callback.origin, "https://www.mirailabstore.com")
  assert.equal(callback.pathname, "/auth/confirm")
  assert.equal(callback.searchParams.get("type"), "recovery")
  assert.equal(callback.searchParams.get("token_hash"), "test-recovery-hash")
  assert.doesNotMatch(deliveries[0].html + deliveries[0].text, /localhost|access_token/)
  assert.equal(response.headers.get("cache-control"), "no-store")
})

test("an unknown account gets the same neutral response and no email", async () => {
  const { route, deliveries } = setup({ data: { properties: null }, error: { code: "user_not_found" } })
  const response = await route.POST(request())
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(deliveries.length, 0)
})

test("the hosted Supabase template independently targets the recovery callback", () => {
  const rendered = hostedTemplate.replaceAll("{{ .TokenHash }}", "test-recovery-hash").replaceAll("&amp;", "&")
  const callback = new URL(rendered.match(/href="([^"]+)"/)[1])
  assert.equal(callback.origin, "https://www.mirailabstore.com")
  assert.equal(callback.pathname, "/auth/confirm")
  assert.equal(callback.searchParams.get("token_hash"), "test-recovery-hash")
  assert.equal(callback.searchParams.get("type"), "recovery")
  assert.doesNotMatch(rendered, /ConfirmationURL|SiteURL|RedirectTo|localhost/)
})
