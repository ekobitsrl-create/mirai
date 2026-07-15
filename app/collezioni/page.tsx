import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopGrid } from "@/components/shop-grid"
import { withoutBlackIslandProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Collezioni",
  description: "Esplora tutte le collezioni MIRAI: streetwear, cappelli custom New Era, accessori esclusivi. Pezzi unici fatti a mano con cristalli e borchie.",
  openGraph: {
    title: "Collezioni MIRAI - Streetwear & Cappelli Custom",
    description: "Esplora tutte le collezioni MIRAI. Streetwear esclusivo e cappelli custom.",
  },
}

export default async function CollezioniPage() {
  const supabase = await createClient()

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
  ])

  const categories = categoriesRes.data || []
  const products = withoutBlackIslandProducts(productsRes.data || [])

  // Separate parents and subcategories
  const parentCategories = categories.filter((c) => !c.parent_id)
  const subcategories = categories.filter((c) => c.parent_id)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ShopGrid
        products={products}
        parentCategories={parentCategories}
        subcategories={subcategories}
      />
      <Footer />
    </main>
  )
}
