import { Navbar } from "@/components/navbar"

import { Hero } from "@/components/hero"
import { Collections } from "@/components/collections"
import { ProductGrid } from "@/components/product-grid"
import { Features } from "@/components/features"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { withDemoProducts } from "@/lib/products"
import { HomeSeoContent } from "@/components/seo-content"
import { buildSeoMetadata, createWebPageJsonLd } from "@/lib/seo"
import { safeJsonLd } from "@/lib/json-ld"
import type { Locale } from "@/lib/translations"
import { HOME_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { localizedOrganicPath } from "@/lib/international-seo"

export const revalidate = 300

const HOME_DESCRIPTION =
  "MIRAI LAB STORE: streetwear a Catania e online. Scopri abbigliamento urban uomo, t-shirt oversize, cappelli custom e il Custom Lab."

export const metadata = buildSeoMetadata({
  title: "Streetwear Catania | MIRAI LAB STORE",
  description: HOME_DESCRIPTION,
  path: "/",
  localizedAlternates: true,
  absoluteTitle: true,
  keywords: [
    "streetwear Catania",
    "abbigliamento streetwear Catania",
    "MIRAI Lab Store",
    "MIRAI Concept Store",
    "MIRAI streetwear",
    "abbigliamento urban uomo",
  ],
})

export default async function Home({ locale = "it" }: { locale?: Locale } = {}) {
  let products: any[] = []
  let categories: any[] = []
  try {
    const supabase = await createClient()
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, description, price, category, image_url, sizes, in_stock, is_new, created_at, stock_by_size, supplier_sku, color_name")
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(32),
      supabase.from("categories").select("*").is("parent_id", null).order("name", { ascending: true }),
    ])
    products = withDemoProducts(prodRes.data || []).slice(0, 8)
    const publicCategories = (catRes.data || []).filter((category) => {
      const slug = String(category.slug || "").toLowerCase()
      return slug !== "mirai-parfum-exlusive" && slug !== "mirai-parfum-exclusive"
    })
    const hasCanonicalFelpe = publicCategories.some(
      (category) => String(category.slug || "").toLowerCase() === "felpe",
    )
    categories = publicCategories.filter((category) => {
      const slug = String(category.slug || "").toLowerCase()
      return !hasCanonicalFelpe || slug !== "sweatshirts"
    })
  } catch (e) {
    console.error("[v0] Failed to fetch data:", e)
  }

  products = withDemoProducts(products).slice(0, 8)

  const seoCopy = HOME_ORGANIC_SEO[locale]

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(createWebPageJsonLd({ name: seoCopy.title, description: seoCopy.description, path: localizedOrganicPath("/", locale), locale })),
        }}
      />
      <Navbar />
      <Hero />
      <Collections categories={categories} />
      <ProductGrid products={products} />
      <Features />
      <HomeSeoContent />
      <Newsletter />
      <Footer />
    </main>
  )
}
