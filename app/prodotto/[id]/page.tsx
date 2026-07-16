import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { DEMO_PRODUCTS, getDemoProduct, isBlackIslandProduct, withoutBlackIslandProducts } from "@/lib/products"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mirai-clothing.vercel.app"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<import("next").Metadata> {
  const { id } = await params
  const demoProduct = getDemoProduct(id)
  let product: any = demoProduct
  if (!product) {
    const supabase = await createClient()
    const { data } = await supabase.from("products").select("name, description, price, image_url").eq("id", id).single()
    product = data
  }

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

  let product: any = getDemoProduct(id)
  if (!product) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
    product = data
  }

  if (!product || isBlackIslandProduct(product)) notFound()

  // Fetch related products from same subcategory
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .eq("in_stock", true)
    .limit(4)

  const relatedById = new Map(
    [
      ...DEMO_PRODUCTS.filter((item) => item.id !== product.id && item.category === product.category && item.in_stock),
      ...(related || []),
    ].map((item) => [item.id, item])
  )
  const relatedProducts = withoutBlackIslandProducts([...relatedById.values()]).slice(0, 4)

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
      name: product.brand || "MIRAI",
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
    <main className="relative min-h-screen overflow-hidden bg-[#15101d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <div className="pointer-events-none absolute inset-x-0 top-20 h-[950px] overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[135px]" />
        <div className="absolute -right-44 top-0 h-[620px] w-[620px] rounded-full bg-fuchsia-500/10 blur-[160px]" />
        <div className="absolute left-1/2 top-[520px] h-64 w-[70%] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
      </div>
      <div className="relative pb-24 pt-36">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </div>
      <div className="relative">
        <Footer />
      </div>
    </main>
  )
}
