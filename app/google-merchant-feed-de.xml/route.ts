import type { NextRequest } from "next/server"
import { getMerchantFeedResponse } from "@/app/google-merchant-feed.xml/route"
import { MERCHANT_FEED_CONFIG } from "@/lib/merchant-feed-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  return getMerchantFeedResponse(request, MERCHANT_FEED_CONFIG.de)
}
