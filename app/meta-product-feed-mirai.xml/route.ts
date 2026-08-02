import type { NextRequest } from "next/server"
import { NextRequest as MetaFeedRequest } from "next/server"
import { GET as getMerchantFeed } from "@/app/google-merchant-feed.xml/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const feedUrl = request.nextUrl.clone()
  feedUrl.pathname = "/google-merchant-feed.xml"
  feedUrl.searchParams.set("supplier", "mirai")
  feedUrl.searchParams.set("platform", "meta")

  const response = await getMerchantFeed(new MetaFeedRequest(feedUrl, { headers: request.headers }))
  const headers = new Headers(response.headers)
  headers.set("Content-Disposition", 'inline; filename="mirai-meta-catalog.xml"')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
