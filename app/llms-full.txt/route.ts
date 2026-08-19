import { buildLlmsCatalog } from "@/lib/llm-discovery"

export const dynamic = "force-dynamic"

export async function GET() {
  return new Response(await buildLlmsCatalog(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
    },
  })
}
