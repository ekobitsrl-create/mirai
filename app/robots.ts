import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/community/", "/checkout/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
