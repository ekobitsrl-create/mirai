import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import {
  isPrivateCheckoutProduct,
  isProductPublished,
  withoutBlackIslandProducts,
} from "@/lib/products"
import { SITE_URL } from "@/lib/site-url"
import { SEO_GUIDES } from "@/lib/seo-guides"
import {
  getOrganicLanguageAlternates,
  localizedOrganicPath,
  ORGANIC_LOCALES,
} from "@/lib/international-seo"

export const dynamic = "force-dynamic"

function localizedEntries(
  path: string,
  values: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const alternates = { languages: getOrganicLanguageAlternates(path) }
  return ORGANIC_LOCALES.map((locale) => ({
    ...values,
    url: `${SITE_URL}${localizedOrganicPath(path, locale)}`,
    alternates,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Array<{
    id: string
    name: string | null
    image_url: string | null
    updated_at: string | null
    is_published: boolean | null
  }> = []
  let categories: Array<{ slug: string; updated_at: string | null }> = []

  try {
    const supabase = await createClient()
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, image_url, updated_at, is_published"),
      supabase.from("categories").select("slug, updated_at"),
    ])
    products = productsResult.data || []
    categories = categoriesResult.data || []
  } catch (error) {
    console.error("Sitemap: catalogo Supabase non disponibile.", error)
  }

  const visibleDatabaseProducts = withoutBlackIslandProducts(products).filter(
    (product) => isProductPublished(product) && !isPrivateCheckoutProduct(product),
  )

  const productUrls: MetadataRoute.Sitemap = visibleDatabaseProducts.flatMap((p) =>
    localizedEntries(`/prodotto/${encodeURIComponent(p.id)}`, {
      lastModified: p.updated_at || "2026-07-21",
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  )

  const priorityCategorySlugs = ["t-shirt", "cappelli", "camicie", "pantaloni"]
  const categoryMap = new Map(categories.map((category) => [category.slug, category.updated_at]))
  priorityCategorySlugs.forEach((slug) => {
    if (!categoryMap.has(slug)) categoryMap.set(slug, null)
  })

  const categoryUrls: MetadataRoute.Sitemap = [...categoryMap.entries()].flatMap(([slug, updatedAt]) =>
    localizedEntries(`/collezione/${encodeURIComponent(slug)}`, {
      lastModified: updatedAt || "2026-07-21",
      changeFrequency: "weekly" as const,
      priority: priorityCategorySlugs.includes(slug) ? 0.8 : 0.7,
    }),
  )

  const guideUrls: MetadataRoute.Sitemap = SEO_GUIDES.flatMap((guide) =>
    localizedEntries(`/guide/${guide.slug}`, {
      lastModified: guide.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  )

  const staticPages: MetadataRoute.Sitemap = [
    ...localizedEntries("/", { changeFrequency: "daily", priority: 1.0 }),
    ...localizedEntries("/collezioni", { changeFrequency: "weekly", priority: 0.9 }),
    {
      url: `${SITE_URL}/custom-lab`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...localizedEntries("/guide", { lastModified: "2026-07-21", changeFrequency: "weekly", priority: 0.75 }),
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
      url: `${SITE_URL}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/termini`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]

  return [...staticPages, ...categoryUrls, ...guideUrls, ...productUrls]
}
