import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopGrid } from "@/components/shop-grid"
import { withDemoProducts } from "@/lib/products"
import { CatalogSeoContent } from "@/components/seo-content"
import { buildSeoMetadata, createWebPageJsonLd } from "@/lib/seo"
import { safeJsonLd } from "@/lib/json-ld"
import type { Locale } from "@/lib/translations"
import { COLLECTIONS_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { localizedOrganicPath } from "@/lib/international-seo"

export const revalidate = 300

const COLLECTIONS_DESCRIPTION =
  "Acquista abbigliamento streetwear online: t-shirt oversize, camicie, bermuda, cappelli custom e selezioni urban uomo MIRΛI."

export const metadata = buildSeoMetadata({
  title: "Abbigliamento streetwear online",
  description: COLLECTIONS_DESCRIPTION,
  path: "/collezioni",
  localizedAlternates: true,
  keywords: [
    "abbigliamento streetwear online",
    "shop streetwear italiano",
    "abbigliamento urban uomo",
    "streetwear premium online",
    "concept store streetwear",
    "abbigliamento oversize uomo",
  ],
})

export default async function CollezioniPage({ locale = "it" }: { locale?: Locale } = {}) {
  const supabase = await createClient()

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, price, category, image_url, sizes, in_stock, is_new, is_published, is_preorder, preorder_release_at, drop_name, created_at, brand, supplier_profile, supplier_sku, gtin, shipping_min_days, shipping_max_days, color_name, color_hex, fit_note, detail_items, composition, care, stock_by_size, image_gallery")
      .order("created_at", { ascending: false }),
  ])

  const categories = (categoriesRes.data || []).filter(
    (category) => category.slug?.toLowerCase() !== "abbigliamento"
  )
  const products = withDemoProducts(productsRes.data || [])

  // Separate parents and subcategories
  const parentCategories = categories.filter((c) => !c.parent_id)
  const subcategories = categories.filter((c) => c.parent_id)

  const seoCopy = COLLECTIONS_ORGANIC_SEO[locale]

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(createWebPageJsonLd({
            type: "CollectionPage",
            name: seoCopy.title,
            description: seoCopy.description,
            path: localizedOrganicPath("/collezioni", locale),
            locale,
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
