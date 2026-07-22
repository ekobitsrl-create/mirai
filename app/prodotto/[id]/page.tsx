import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { getDemoProduct, getProductSupplierSettings, isBlackIslandProduct, isPrivateCheckoutProduct, withoutBlackIslandProducts } from "@/lib/products"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"

function absoluteProductImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return undefined
  return imageUrl.startsWith("http") ? imageUrl : getAbsoluteUrl(imageUrl)
}

function hasAvailableStock(product: { in_stock?: boolean; stock_by_size?: Record<string, number> | null }) {
  if (!product.in_stock) return false
  const stock = product.stock_by_size
  return !stock || Object.values(stock).some((quantity) => Number(quantity) > 0)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<import("next").Metadata> {
  const { id } = await params
  const demoProduct = getDemoProduct(id)
  let product: any = demoProduct
  if (!product) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, brand, supplier_sku, in_stock, stock_by_size")
      .eq("id", id)
      .single()
    product = data
  }

  if (!product || isBlackIslandProduct(product)) return { title: "Prodotto non trovato" }

  const description = product.description || `Scopri ${product.name} su MIRAI. Pezzo esclusivo fatto a mano.`
  const imageUrl = absoluteProductImage(product.image_url)
  const productPath = `/prodotto/${encodeURIComponent(id)}`

  return {
    title: product.name,
    description,
    robots: isPrivateCheckoutProduct(product) ? { index: false, follow: false } : undefined,
    alternates: { canonical: productPath },
    openGraph: {
      title: `${product.name} - MIRAI`,
      description,
      type: "website",
      url: getAbsoluteUrl(productPath),
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 1067, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - MIRAI`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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

  const relatedProducts = withoutBlackIslandProducts(related || []).slice(0, 4)

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

  const productUrl = getAbsoluteUrl(`/prodotto/${encodeURIComponent(product.id)}`)
  const primaryImage = absoluteProductImage(product.image_url)
  const galleryImages = (product.image_gallery || [])
    .map((image: { src?: string }) => absoluteProductImage(image.src))
    .filter(Boolean)
  const productImages = [...new Set([primaryImage, ...galleryImages].filter(Boolean))]
  const availability = hasAvailableStock(product)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock"
  const supplierSettings = getProductSupplierSettings(product)
  const isSupplierTimedShipping = supplierSettings.shippingMinDays !== undefined
    && supplierSettings.shippingMaxDays !== undefined

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description || `${product.name} - MIRAI`,
    image: productImages.length ? productImages : undefined,
    sku: product.supplier_sku || product.id,
    mpn: supplierSettings.mpn,
    gtin: supplierSettings.gtin,
    brand: {
      "@type": "Brand",
      name: supplierSettings.brand,
    },
    color: product.color_name || undefined,
    material: product.composition || undefined,
    size: product.sizes?.length ? product.sizes : undefined,
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: "EUR",
      price: Number(product.price).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IT",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: isSupplierTimedShipping ? 0 : 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: isSupplierTimedShipping ? supplierSettings.shippingMinDays : 3,
            maxValue: isSupplierTimedShipping ? supplierSettings.shippingMaxDays : 5,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IT",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
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
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parentName,
        item: getAbsoluteUrl(`/collezione/${encodeURIComponent(parentSlug)}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
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
