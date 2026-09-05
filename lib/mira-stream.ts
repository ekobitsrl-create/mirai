/** Read SSE across arbitrary UTF-8/network chunk boundaries. Used by both ends of MIRA. */
export async function* readMiraEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let ended = false
  try {
    while (!ended) {
      const { value, done } = await reader.read()
      ended = done
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      // Normalize only complete CRLF pairs; a CR can arrive in a separate chunk.
      buffer = buffer.replace(/\r\n/g, "\n")
      if (done && buffer.trim()) buffer += "\n\n"
      let boundary: number
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        const data = block.split("\n").filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart()).join("\n")
        if (!data || data === "[DONE]") continue
        const event: unknown = JSON.parse(data)
        if (event && typeof event === "object" && !Array.isArray(event)) {
          yield event as Record<string, unknown>
        }
      }
      if (buffer.length > 1_000_000) throw new Error("MIRA stream event too large")
    }
  } finally {
    if (!ended) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export function encodeMiraEvent(event: Record<string, unknown>) {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
}
