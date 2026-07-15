import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { isBlackIslandProduct, withoutBlackIslandProducts } from "@/lib/products"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mirai-clothing.vercel.app"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<import("next").Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from("products").select("name, description, price, image_url").eq("id", id).single()

  if (!product || isBlackIslandProduct(product)) return { title: "Prodotto non trovato" }

  const description = product.description || `Scopri ${product.name} su MIRAI. Pezzo esclusivo fatto a mano.`
  const imageUrl = product.image_url?.startsWith("http") ? product.image_url : `${BASE_URL}${product.image_url}`

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} - MIRAI`,
      description,
      type: "website",
      images: product.image_url ? [{ url: imageUrl, width: 800, height: 1067, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - MIRAI`,
      description,
      images: product.image_url ? [imageUrl] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (!product || isBlackIslandProduct(product)) notFound()

  // Fetch related products from same subcategory
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .eq("in_stock", true)
    .limit(4)

  // Resolve subcategory → parent category for breadcrumb
  const { data: subcat } = await supabase
    .from("categories")
    .select("name, slug, parent_id")
    .eq("slug", product.category)
    .single()
  let parentSlug = product.category
  let parentName = product.category
  if (subcat?.parent_id) {
    const { data: parent } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("id", subcat.parent_id)
      .single()
    if (parent) {
      parentSlug = parent.slug
      parentName = parent.name
    }
  } else if (subcat) {
    parentSlug = subcat.slug
    parentName = subcat.name
  }

  const imageUrl = product.image_url?.startsWith("http") ? product.image_url : `${BASE_URL}${product.image_url}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - MIRAI`,
    image: product.image_url ? imageUrl : undefined,
    brand: {
      "@type": "Brand",
      name: "MIRAI",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/prodotto/${product.id}`,
      priceCurrency: "EUR",
      price: Number(product.price).toFixed(2),
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "MIRAI",
      },
    },
    category: product.category,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parentName,
        item: `${BASE_URL}/collezione/${parentSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${BASE_URL}/prodotto/${product.id}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#f8f6fb]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <div className="pt-32 pb-20">
        <ProductDetail product={product} relatedProducts={withoutBlackIslandProducts(related || [])} />
      </div>
      <Footer />
    </main>
  )
}
