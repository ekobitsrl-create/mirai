import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../lib/mira-stream.ts", import.meta.url), "utf8")
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { readMiraEvents, encodeMiraEvent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

function bytes(text, chunkSize = 1) {
  const data = new TextEncoder().encode(text)
  return new ReadableStream({ start(controller) {
    for (let index = 0; index < data.length; index += chunkSize) controller.enqueue(data.slice(index, index + chunkSize))
    controller.close()
  } })
}

test("preserves accented text and emoji split at every UTF-8 byte and CRLF boundary", async () => {
  const input = ': keepalive\r\n\r\nevent: delta\r\ndata: {"type":"delta","text":"È già qui 👋"}\r\n\r\ndata: {"type":"done"}\r\n\r\n'
  assert.deepEqual(await Array.fromAsync(readMiraEvents(bytes(input))), [{ type: "delta", text: "È già qui 👋" }, { type: "done" }])
})

test("reads several events per chunk, ignores comments and DONE sentinel", async () => {
  const input = ': ping\n\ndata: {"type":"delta",\ndata: "text":"ciao"}\n\ndata: [DONE]\n\ndata: {"type":"done"}'
  assert.deepEqual(await Array.fromAsync(readMiraEvents(bytes(input, 2048))), [{ type: "delta", text: "ciao" }, { type: "done" }])
})

test("cancels the upstream stream when the consumer stops", async () => {
  let cancelled = false
  const body = new ReadableStream({ start(controller) { controller.enqueue(encodeMiraEvent({ type: "delta", text: "a" })) }, cancel() { cancelled = true } })
  for await (const event of readMiraEvents(body)) { assert.equal(event.text, "a"); break }
  assert.equal(cancelled, true)
  assert.equal(body.locked, false)
})

test("malformed events fail rather than silently reporting a complete answer", async () => {
  await assert.rejects(async () => { for await (const event of readMiraEvents(bytes('data: {broken}\n\n'))) void event }, SyntaxError)
})

test("encoding does not turn answer newlines into protocol events", async () => {
  const event = { type: "delta", text: 'first\n\ndata: {"type":"done"}\nlast' }
  const body = new ReadableStream({ start(controller) { controller.enqueue(encodeMiraEvent(event)); controller.close() } })
  assert.deepEqual(await Array.fromAsync(readMiraEvents(body)), [event])
})
