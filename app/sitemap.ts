import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { isPrivateCheckoutProduct, withoutBlackIslandProducts } from "@/lib/products"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Array<{ id: string; name: string | null; image_url: string | null; updated_at: string | null }> = []
  let categories: Array<{ slug: string; updated_at: string | null }> = []

  try {
    const supabase = await createClient()
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, image_url, updated_at")
        .eq("in_stock", true),
      supabase.from("categories").select("slug, updated_at"),
    ])
    products = productsResult.data || []
    categories = categoriesResult.data || []
  } catch (error) {
    console.error("Sitemap: catalogo Supabase non disponibile.", error)
  }

  const visibleDatabaseProducts = withoutBlackIslandProducts(products).filter(
    (product) => !isPrivateCheckoutProduct(product),
  )

  const productUrls: MetadataRoute.Sitemap = visibleDatabaseProducts.map((p) => ({
    url: `${SITE_URL}/prodotto/${encodeURIComponent(p.id)}`,
    lastModified: p.updated_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/collezione/${encodeURIComponent(c.slug)}`,
    lastModified: c.updated_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/collezioni`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/custom-lab`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/negozio`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/i-nostri-beat`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/chi-siamo`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contatti`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/spedizioni`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/resi`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/termini`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]

  return [...staticPages, ...categoryUrls, ...productUrls]
}
