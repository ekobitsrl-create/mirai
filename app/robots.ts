import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/admin/",
    "/account/",
    "/community/",
    "/checkout/",
    "/auth/",
    "/api/",
    "/success/",
    "/cancel/",
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      ...[
        "OAI-SearchBot",
        "ChatGPT-User",
        "OAI-AdsBot",
        "Claude-SearchBot",
        "Claude-User",
        "PerplexityBot",
        "Perplexity-User",
      ].map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privatePaths,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
