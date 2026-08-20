import { createClient, createUserClient, getServerUser } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { FirstProductDiscountModal } from "@/components/first-product-discount-modal"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import {
  getDemoProduct,
  getProductSupplierSettings,
  hasMinimalMerchantBrand,
  isBlackIslandProduct,
  isPrivateCheckoutProduct,
  mapProductRow,
  withDemoProducts,
} from "@/lib/products"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"
import { safeJsonLd } from "@/lib/json-ld"
import { getShippingCostCents, SHIPPING_CONFIG } from "@/lib/shipping"
import { getOrganicLanguageAlternates } from "@/lib/international-seo"
import { HTML_LOCALES, localizedOrganicPath } from "@/lib/international-seo"
import type { Locale } from "@/lib/translations"
import { localizeProduct } from "@/lib/catalog-localization"
import { translateCategory } from "@/lib/site-localization"

export const dynamic = "force-dynamic"

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
    const communityUser = await getServerUser()
    const authenticatedClient = communityUser ? await createUserClient() : null
    const supabase = authenticatedClient || await createClient()
    const { data } = await supabase
      .from("products")
      .select("id, name, description, price, category, image_url, brand, supplier_sku, in_stock, stock_by_size, color_name, community_only, is_preorder, preorder_release_at, drop_name")
      .eq("id", id)
      .single()
    product = data ? mapProductRow(data) : null
  }

  if (!product || isBlackIslandProduct(product)) return { title: "Prodotto non trovato" }

  const description = product.description || `Scopri ${product.name} su MIRAI: design streetwear curato nei dettagli, disponibile nelle taglie indicate.`
  const imageUrl = absoluteProductImage(product.image_url)
  const productPath = `/prodotto/${encodeURIComponent(id)}`

  return {
    title: product.name,
    description,
    robots: isPrivateCheckoutProduct(product) || product.community_only ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: productPath,
      languages: isPrivateCheckoutProduct(product) || product.community_only ? undefined : getOrganicLanguageAlternates(productPath),
    },
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

export default async function ProductPage({ params }: { params: Promise<{ id: string; locale?: Locale }> }) {
  const { id, locale = "it" } = await params
  const communityUser = await getServerUser()
  const authenticatedClient = communityUser ? await createUserClient() : null
  const supabase = authenticatedClient || await createClient()

  let product: any = getDemoProduct(id)
  if (!product) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
    product = data ? mapProductRow(data) : null
  }

  if (!product || isBlackIslandProduct(product)) notFound()

  // Fetch enough products to connect colour variants while still providing
  // a separate set of related recommendations.
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .eq("community_only", product.community_only === true)
    .neq("id", product.id)
    .eq("in_stock", true)
    .limit(32)

  const relatedProducts = withDemoProducts(related || []).slice(0, 32)

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

  const localized = localizeProduct(product, locale)
  const productUrl = getAbsoluteUrl(localizedOrganicPath(`/prodotto/${encodeURIComponent(product.id)}`, locale))
  const primaryImage = absoluteProductImage(product.image_url)
  const galleryImages = (product.image_gallery || [])
    .map((image: { src?: string }) => absoluteProductImage(image.src))
    .filter(Boolean)
  const productImages = [...new Set([primaryImage, ...galleryImages].filter(Boolean))]
  const availability = hasAvailableStock(product)
    ? product.is_preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock"
    : "https://schema.org/OutOfStock"
  const supplierSettings = getProductSupplierSettings(product)
  const isSupplierTimedShipping = supplierSettings.shippingMinDays !== undefined
    && supplierSettings.shippingMaxDays !== undefined

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: localized.name,
    description: localized.description || `${localized.name} - MIRAI`,
    inLanguage: HTML_LOCALES[locale],
    image: productImages.length ? productImages : undefined,
    sku: product.supplier_sku || product.id,
    mpn: supplierSettings.mpn,
    gtin: supplierSettings.gtin,
    brand: {
      "@type": "Brand",
      name: supplierSettings.brand,
    },
    color: localized.colorName || undefined,
    material: localized.composition || undefined,
    size: product.sizes?.length ? product.sizes : undefined,
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: "EUR",
      price: Number(product.price).toFixed(2),
      availability,
      availabilityStarts: product.is_preorder && product.preorder_release_at
        ? product.preorder_release_at
        : undefined,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
      shippingDetails: SHIPPING_CONFIG.allowedCountries.map((countryCode) => ({
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (getShippingCostCents(countryCode) / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: countryCode,
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
      })),
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IT",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        refundType: "https://schema.org/FullRefund",
        restockingFee: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "EUR",
        },
        url: getAbsoluteUrl("/resi"),
      },
    },
    category: translateCategory(product.category, product.category, locale),
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
        name: translateCategory(parentSlug, parentName, locale),
        item: getAbsoluteUrl(localizedOrganicPath(`/collezione/${encodeURIComponent(parentSlug)}`, locale)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: localized.name,
        item: productUrl,
      },
    ],
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#15101d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <Navbar />
      {hasMinimalMerchantBrand(product) ? <FirstProductDiscountModal /> : null}
      <div className="pointer-events-none absolute inset-x-0 top-20 h-[950px] overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[135px]" />
        <div className="absolute -right-44 top-0 h-[620px] w-[620px] rounded-full bg-fuchsia-500/10 blur-[160px]" />
        <div className="absolute left-1/2 top-[520px] h-64 w-[70%] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
      </div>
      <div className="relative pb-40 pt-24 sm:pb-24 sm:pt-28 lg:pt-32">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </div>
      <div className="relative">
        <Footer />
      </div>
    </main>
  )
}
