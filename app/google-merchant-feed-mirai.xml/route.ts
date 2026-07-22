import type { NextRequest } from "next/server"
import { NextRequest as MerchantFeedRequest } from "next/server"
import { GET as getMerchantFeed } from "@/app/google-merchant-feed.xml/route"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const feedUrl = request.nextUrl.clone()
  feedUrl.pathname = "/google-merchant-feed.xml"
  feedUrl.searchParams.set("supplier", "mirai")

  return getMerchantFeed(new MerchantFeedRequest(feedUrl, { headers: request.headers }))
}
