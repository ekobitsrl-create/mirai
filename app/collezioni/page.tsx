import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopGrid } from "@/components/shop-grid"
import { withDemoProducts } from "@/lib/products"
import { CatalogSeoContent } from "@/components/seo-content"
import { buildSeoMetadata, createWebPageJsonLd } from "@/lib/seo"

export const dynamic = "force-dynamic"

const COLLECTIONS_DESCRIPTION =
  "Acquista abbigliamento streetwear online: t-shirt oversize, camicie, bermuda, cappelli custom e selezioni urban uomo MIRAI."

export const metadata = buildSeoMetadata({
  title: "Abbigliamento streetwear online",
  description: COLLECTIONS_DESCRIPTION,
  path: "/collezioni",
  keywords: [
    "abbigliamento streetwear online",
    "shop streetwear italiano",
    "abbigliamento urban uomo",
    "streetwear premium online",
    "concept store streetwear",
    "abbigliamento oversize uomo",
  ],
})

export default async function CollezioniPage() {
  const supabase = await createClient()

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
  ])

  const categories = categoriesRes.data || []
  const products = withDemoProducts(productsRes.data || [])

  // Separate parents and subcategories
  const parentCategories = categories.filter((c) => !c.parent_id)
  const subcategories = categories.filter((c) => c.parent_id)

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({
            type: "CollectionPage",
            name: "Abbigliamento streetwear online",
            description: COLLECTIONS_DESCRIPTION,
            path: "/collezioni",
          })),
        }}
      />
      <Navbar />
      <ShopGrid
        products={products}
        parentCategories={parentCategories}
        subcategories={subcategories}
      />
      <CatalogSeoContent />
      <Footer />
    </main>
  )
}
