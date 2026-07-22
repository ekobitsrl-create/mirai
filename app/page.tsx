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

export const dynamic = "force-dynamic"

const HOME_DESCRIPTION =
  "MIRAI LAB STORE: streetwear a Catania e online. Scopri abbigliamento urban uomo, t-shirt oversize, cappelli custom e il Custom Lab."

export const metadata = buildSeoMetadata({
  title: "Streetwear Catania | MIRAI LAB STORE",
  description: HOME_DESCRIPTION,
  path: "/",
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

export default async function Home() {
  let products: any[] = []
  let categories: any[] = []
  try {
    const supabase = await createClient()
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(32),
      supabase.from("categories").select("*").is("parent_id", null).order("name", { ascending: true }),
    ])
    products = withDemoProducts(prodRes.data || []).slice(0, 8)
    categories = catRes.data || []
  } catch (e) {
    console.error("[v0] Failed to fetch data:", e)
  }

  products = withDemoProducts(products).slice(0, 8)

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({ name: "Streetwear Catania - MIRAI LAB STORE", description: HOME_DESCRIPTION, path: "/" })),
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
