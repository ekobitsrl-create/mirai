import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { DEMO_PRODUCTS, isPrivateCheckoutProduct, withoutBlackIslandProducts } from "@/lib/products"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mirai-clothing.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, image_url, updated_at")
    .eq("in_stock", true)

  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")

  const visibleDatabaseProducts = withoutBlackIslandProducts(products || [])

  const productUrls: MetadataRoute.Sitemap = visibleDatabaseProducts.map((p) => ({
    url: `${BASE_URL}/prodotto/${p.id}`,
    lastModified: p.updated_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const databaseProductIds = new Set(visibleDatabaseProducts.map((product) => product.id))
  const staticProductUrls: MetadataRoute.Sitemap = DEMO_PRODUCTS
    .filter((product) => product.in_stock && !databaseProductIds.has(product.id) && !isPrivateCheckoutProduct(product))
    .map((product) => ({
      url: `${BASE_URL}/prodotto/${product.id}`,
      lastModified: product.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${BASE_URL}/collezione/${c.slug}`,
    lastModified: c.updated_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/collezioni`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/custom-lab`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/negozio`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/i-nostri-beat`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/chi-siamo`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contatti`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/spedizioni`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/resi`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/termini`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]

  return [...staticPages, ...categoryUrls, ...staticProductUrls, ...productUrls]
}
