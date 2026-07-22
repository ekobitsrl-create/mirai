import type { Metadata } from "next"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionProducts } from "@/components/collection-products"
import { notFound } from "next/navigation"
import { withDemoProducts, type StoreProduct } from "@/lib/products"
import { getAbsoluteUrl } from "@/lib/site-url"
import type { SupabaseClient } from "@supabase/supabase-js"
import { CategorySeoContent } from "@/components/seo-content"
import { buildSeoMetadata, createBreadcrumbJsonLd, createWebPageJsonLd, getCategorySeo } from "@/lib/seo"

const STATIC_CATEGORY_NAMES: Record<string, string> = {
  "t-shirt": "T-Shirt",
  cappelli: "Cappelli",
  camicie: "Camicie",
  pantaloni: "Pantaloni e Bermuda",
  bermuda: "Bermuda",
  shorts: "Shorts e Bermuda",
}

// Builds a virtual category for slugs that exist as product categories but don't
// have a row in the `categories` table, deriving the cover image from the DB.
async function getStaticCategory(slug: string, supabase: SupabaseClient) {
  const { data: matchingProduct } = await supabase
    .from("products")
    .select("image_url")
    .eq("category", slug)
    .limit(1)
    .maybeSingle()
  if (!matchingProduct && !STATIC_CATEGORY_NAMES[slug]) return null

  return {
    id: `static-${slug}`,
    name: STATIC_CATEGORY_NAMES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    slug,
    description: `Scopri i nuovi capi ${STATIC_CATEGORY_NAMES[slug] || slug} disponibili su MIRAI LAB STORE.`,
    image_url: matchingProduct?.image_url || null,
    parent_id: null,
    sort_order: 99,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase().replace(/\s+/g, '-')
  const supabase = await createClient()
  let { data: category } = await supabase.from("categories").select("name, description, image_url").eq("slug", slug).single()
  if (!category) {
    const { data: categoryByIlike } = await supabase.from("categories").select("name, description, image_url").ilike("slug", slug).single()
    category = categoryByIlike
  }

  if (!category) category = await getStaticCategory(slug, supabase)

  const seo = getCategorySeo(slug)

  if (!category && !seo) return { title: "Collezione non trovata", robots: { index: false, follow: true } }

  const categoryName = category?.name || STATIC_CATEGORY_NAMES[slug] || slug
  const description = seo?.description
    || category?.description
    || `Scopri la collezione ${categoryName} su MIRAI. Pezzi esclusivi di streetwear e accessori custom.`
  const title = seo?.title || `${categoryName} - Collezione`

  return buildSeoMetadata({
    title,
    description,
    path: `/collezione/${encodeURIComponent(slug)}`,
    keywords: seo?.keywords || [categoryName, `${categoryName} streetwear`, "MIRAI streetwear"],
    image: category?.image_url ? getAbsoluteUrl(category.image_url) : undefined,
  })
}

export default async function CollezionePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  // Normalize the slug: decode URI, trim, lowercase, replace spaces with hyphens
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase().replace(/\s+/g, '-')
  
  const supabase = await createClient()

  // Get category by slug (try normalized slug first, then original)
  let { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  // If not found with normalized slug, try case-insensitive match
  if (!category) {
    const { data: categoryByIlike } = await supabase
      .from("categories")
      .select("*")
      .ilike("slug", slug)
      .single()
    category = categoryByIlike
  }

  if (!category) category = await getStaticCategory(slug, supabase)

  if (!category) {
    notFound()
  }

  const seo = getCategorySeo(slug)

  const isParent = category.parent_id === null

  // Get subcategories if this is a parent category
  let subcategories: any[] = []
  if (isParent) {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", category.id)
      .order("sort_order", { ascending: true })
    subcategories = data || []
  }

  // Get products: if parent, get all products in any of its subcategory slugs
  // If subcategory, get products matching this slug
  let products: any[] = []
  if (isParent && subcategories.length > 0) {
    const subSlugs = subcategories.map((s: any) => s.slug)
    const { data } = await supabase
      .from("products")
      .select("*")
      .in("category", subSlugs)
      .order("created_at", { ascending: false })
    products = withDemoProducts((data || []) as StoreProduct[])
  } else {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", category.slug)
      .order("created_at", { ascending: false })
    products = withDemoProducts((data || []) as StoreProduct[])
  }

  // Get all parent categories for sidebar navigation
  const { data: parentCategories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order", { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({
            type: "CollectionPage",
            name: seo?.title || category.name,
            description: seo?.description || category.description || `Collezione ${category.name} MIRAI.`,
            path: `/collezione/${encodeURIComponent(slug)}`,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collezioni", path: "/collezioni" },
            { name: category.name, path: `/collezione/${encodeURIComponent(slug)}` },
          ])),
        }}
      />
      <Navbar />
      <Suspense fallback={<div className="pt-24 min-h-screen" />}>
        <CollectionProducts
          category={category}
          products={products}
          parentCategories={parentCategories || []}
          subcategories={subcategories}
          isParent={isParent}
        />
      </Suspense>
      {seo && <CategorySeoContent seo={seo} />}
      <Footer />
    </main>
  )
}
