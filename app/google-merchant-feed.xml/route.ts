import type { NextRequest } from "next/server"
import { DEMO_PRODUCTS, type StoreProduct } from "@/lib/products"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const FALLBACK_SITE_URL = "https://mirai-clothing.vercel.app"

const GOOGLE_CATEGORY_BY_STORE_CATEGORY: Record<string, string> = {
  "t-shirt": "212",
  tshirt: "212",
  magliette: "212",
  camicie: "212",
  canotte: "212",
  pantaloni: "207",
  shorts: "207",
  bermuda: "207",
}

const PRODUCT_TYPE_BY_STORE_CATEGORY: Record<string, string> = {
  "t-shirt": "Abbigliamento > T-shirt",
  tshirt: "Abbigliamento > T-shirt",
  magliette: "Abbigliamento > T-shirt",
  camicie: "Abbigliamento > Camicie",
  canotte: "Abbigliamento > Canotte",
  pantaloni: "Abbigliamento > Bermuda e shorts",
  shorts: "Abbigliamento > Bermuda e shorts",
  bermuda: "Abbigliamento > Bermuda e shorts",
}

function escapeXml(value: string | number | boolean | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "")
}

function getBaseUrl(request: NextRequest) {
  const requestOrigin = cleanBaseUrl(request.nextUrl.origin)
  if (!requestOrigin.includes("localhost") && !requestOrigin.includes("127.0.0.1")) {
    return requestOrigin
  }

  return cleanBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL
      || process.env.NEXT_PUBLIC_APP_URL
      || FALLBACK_SITE_URL,
  )
}

function absoluteUrl(path: string, baseUrl: string) {
  try {
    return new URL(path, `${baseUrl}/`).toString()
  } catch {
    return ""
  }
}

function normalizedIdentifier(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function stableHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

function getMerchantItemId(product: StoreProduct, size: string) {
  const source = product.supplier_sku
    ? `${product.supplier_sku}-${product.color_name || product.id}-${size}`
    : `${product.id}-${size}`
  const candidate = normalizedIdentifier(source)

  if (candidate.length <= 50) return candidate

  const suffix = stableHash(`${product.id}-${size}`)
  return `${candidate.slice(0, 49 - suffix.length)}-${suffix}`
}

function getItemGroupId(product: StoreProduct) {
  if (product.supplier_sku) {
    return normalizedIdentifier(`${product.brand || "mirai"}-${product.supplier_sku}`)
  }

  return normalizedIdentifier(product.id).slice(0, 50)
}

function getSizes(product: StoreProduct) {
  const sizes = (product.sizes || []).filter(Boolean)
  return sizes.length > 0 ? sizes : ["OS"]
}

function getAvailability(product: StoreProduct, size: string) {
  if (!product.in_stock) return "out_of_stock"
  if (!product.stock_by_size) return "in_stock"
  return (product.stock_by_size[size] || 0) > 0 ? "in_stock" : "out_of_stock"
}

function getAdditionalImages(product: StoreProduct, baseUrl: string, primaryImage: string) {
  const uniqueImages = new Set<string>()

  for (const image of product.image_gallery || []) {
    const imageUrl = absoluteUrl(image.src, baseUrl)
    if (imageUrl && imageUrl !== primaryImage) uniqueImages.add(imageUrl)
  }

  return [...uniqueImages].slice(0, 10)
}

function renderProductVariant(product: StoreProduct, size: string, baseUrl: string) {
  const itemId = getMerchantItemId(product, size)
  const productUrl = absoluteUrl(`/prodotto/${encodeURIComponent(product.id)}`, baseUrl)
  const primaryImage = product.image_url ? absoluteUrl(product.image_url, baseUrl) : ""
  const additionalImages = getAdditionalImages(product, baseUrl, primaryImage)
  const categoryKey = product.category.toLowerCase()
  const titleParts = [product.name, product.color_name, `Taglia ${size}`].filter(Boolean)
  const title = titleParts.join(" - ")
  const description = product.description || `${product.name} disponibile su MIRAI LAB STORE.`
  const brand = product.brand || "MIRAI"
  const itemGroupId = getItemGroupId(product)
  const productType = PRODUCT_TYPE_BY_STORE_CATEGORY[categoryKey] || `Abbigliamento > ${product.category}`
  const googleCategory = GOOGLE_CATEGORY_BY_STORE_CATEGORY[categoryKey] || "1604"
  const availability = getAvailability(product, size)

  return [
    "    <item>",
    `      <g:id>${escapeXml(itemId)}</g:id>`,
    `      <title>${escapeXml(title)}</title>`,
    `      <description>${escapeXml(description)}</description>`,
    `      <link>${escapeXml(productUrl)}</link>`,
    `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>`,
    ...additionalImages.map((image) => `      <g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`),
    `      <g:availability>${availability}</g:availability>`,
    `      <g:price>${Number(product.price).toFixed(2)} EUR</g:price>`,
    "      <g:condition>new</g:condition>",
    `      <g:brand>${escapeXml(brand)}</g:brand>`,
    ...(product.supplier_sku
      ? [
          `      <g:mpn>${escapeXml(product.supplier_sku)}</g:mpn>`,
          "      <g:identifier_exists>yes</g:identifier_exists>",
        ]
      : ["      <g:identifier_exists>no</g:identifier_exists>"]),
    `      <g:google_product_category>${googleCategory}</g:google_product_category>`,
    `      <g:product_type>${escapeXml(productType)}</g:product_type>`,
    `      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>`,
    `      <g:item_group_title>${escapeXml(product.name)}</g:item_group_title>`,
    `      <g:size>${escapeXml(size)}</g:size>`,
    "      <g:size_system>EU</g:size_system>",
    "      <g:size_type>regular</g:size_type>",
    `      <g:color>${escapeXml(product.color_name || "Multicolore")}</g:color>`,
    "      <g:gender>unisex</g:gender>",
    "      <g:age_group>adult</g:age_group>",
    "      <g:adult>no</g:adult>",
    product.is_new ? "      <g:custom_label_0>Nuovi arrivi</g:custom_label_0>" : "",
    "      <g:shipping>",
    "        <g:country>IT</g:country>",
    "        <g:service>Standard</g:service>",
    "        <g:price>0.00 EUR</g:price>",
    "      </g:shipping>",
    "    </item>",
  ].filter(Boolean).join("\n")
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const products = DEMO_PRODUCTS.filter((product) => product.image_url && Number(product.price) > 0)
  const items = products.flatMap((product) =>
    getSizes(product).map((size) => renderProductVariant(product, size, baseUrl)),
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    "    <title>MIRAI LAB STORE</title>",
    `    <link>${escapeXml(baseUrl)}</link>`,
    "    <description>Catalogo prodotti MIRAI LAB STORE per Google Merchant Center</description>",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n")

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
