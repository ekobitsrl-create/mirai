import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import vm from "node:vm"
import test from "node:test"
import ts from "typescript"

const routeSource = await readFile(new URL("../app/api/mira/route.ts", import.meta.url), "utf8")
const streamSource = await readFile(new URL("../lib/mira-stream.ts", import.meta.url), "utf8")
const compile = (source, module) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module } }).outputText
const streamModule = await import(`data:text/javascript;base64,${Buffer.from(compile(streamSource, ts.ModuleKind.ES2022)).toString("base64")}`)

function setup(fetch, env = { OPENAI_API_KEY: "test-only" }) {
  const exports = {}
  const imports = {
    "next/server": { NextResponse: { json: Response.json } },
    "@/lib/supabase/server": { createClient: async () => ({ from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: [] }) }) }) }) }) },
    "@/lib/products": { withDemoProducts: (data) => data, isPrivateCheckoutProduct: () => false },
    "@/lib/shipping": { SHIPPING_CONFIG: { standardDeliveryDays: { minimum: 3, maximum: 5 } } },
    "@/lib/request-security": { isSameOriginRequest: () => true, contentLengthWithin: () => true, consumeRateLimit: async () => true, readJsonBody: (request) => request.json(), RequestBodyTooLargeError: class extends Error {} },
    "@/lib/catalog-localization": { localizeProduct: (product) => product },
    "@/lib/mira-stream": streamModule,
  }
  vm.runInNewContext(compile(routeSource, ts.ModuleKind.CommonJS), {
    exports, require: (name) => { if (!imports[name]) throw new Error(`Unexpected import ${name}`); return imports[name] },
    process: { env }, fetch, Response, Request, ReadableStream, AbortSignal, AbortController, console,
  })
  return exports
}
const request = (body) => new Request("https://example.test/api/mira", { method: "POST", headers: { Accept: "text/event-stream", "Content-Type": "application/json" }, body: JSON.stringify(body) })
const upstream = (events) => new Response(new ReadableStream({ start(controller) {
  for (const event of events) controller.enqueue(streamModule.encodeMiraEvent(event))
  controller.close()
} }))

test("streams text and completion, sends conversational history and never exposes the key", async () => {
  let sent
  const route = setup(async (_url, options) => { sent = JSON.parse(options.body); return upstream([
    { type: "response.output_text.delta", delta: "Ciao, " },
    { type: "response.output_text.delta", delta: "come posso aiutarti?" },
    { type: "response.completed" },
  ]) })
  const response = await route.POST(request({ message: "E in nero?", history: [{ role: "user", content: "Cerco una felpa" }, { role: "assistant", content: "Quale colore?" }] }))
  assert.match(response.headers.get("content-type"), /text\/event-stream/)
  const events = await Array.fromAsync(streamModule.readMiraEvents(response.body))
  assert.deepEqual(events, [{ type: "delta", text: "Ciao, " }, { type: "delta", text: "come posso aiutarti?" }, { type: "done" }])
  assert.equal(sent.input.length, 3)
  assert.equal(sent.store, false)
  assert.equal(sent.stream, true)
  assert.equal(JSON.stringify(events).includes("test-only"), false)
})

test("reports an incomplete upstream answer without a false completion", async () => {
  const route = setup(async () => upstream([{ type: "response.output_text.delta", delta: "Parziale" }, { type: "response.incomplete" }]))
  const response = await route.POST(request({ message: "Ciao" }))
  const events = await Array.fromAsync(streamModule.readMiraEvents(response.body))
  assert.deepEqual(events, [{ type: "delta", text: "Parziale" }, { type: "error" }])
})

test("an absent key is explicit and makes no upstream request", async () => {
  const route = setup(() => { throw new Error("Must not call AI") }, {})
  const response = await route.POST(request({ message: "Ciao" }))
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { configured: false })
})

test("rejects null JSON without crashing", async () => {
  const route = setup(() => { throw new Error("Must not call AI") })
  const response = await route.POST(request(null))
  assert.equal(response.status, 400)
})

test("disconnecting a client aborts the provider request", async () => {
  let signal
  const route = setup(async (_url, options) => {
    signal = options.signal
    return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(streamModule.encodeMiraEvent({ type: "response.output_text.delta", delta: "Ciao" }))
      signal.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError")), { once: true })
    } }))
  })
  const response = await route.POST(request({ message: "Ciao" }))
  const reader = response.body.getReader()
  await reader.read()
  await reader.cancel()
  assert.equal(signal.aborted, true)
})
