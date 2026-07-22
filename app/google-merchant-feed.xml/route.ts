import type { NextRequest } from "next/server"
import { createHash } from "node:crypto"
import { getProductSupplierSettings, isPrivateCheckoutProduct, withDemoProducts, type StoreProduct } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RETURN_POLICY_PATH = "/resi"
const CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at, brand, supplier_profile, supplier_sku, gtin, shipping_min_days, shipping_max_days, color_name, color_hex, image_gallery, detail_items, composition"
const PRE_SUPPLIER_CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at, brand, supplier_sku, color_name, color_hex, image_gallery, detail_items, composition"
const LEGACY_CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at"

const GOOGLE_CATEGORY_BY_STORE_CATEGORY: Record<string, string> = {
  "t-shirt": "212",
  tshirt: "212",
  magliette: "212",
  camicie: "212",
  canotte: "212",
  pantaloni: "207",
  shorts: "207",
  bermuda: "207",
  headwear: "173",
  cappelli: "173",
  caps: "173",
  hats: "173",
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
  headwear: "Accessori > Cappelli personalizzati",
  cappelli: "Accessori > Cappelli personalizzati",
  caps: "Accessori > Cappelli personalizzati",
  hats: "Accessori > Cappelli personalizzati",
}

const HEADWEAR_CATEGORIES = new Set(["headwear", "cappelli", "caps", "hats"])

const COLOR_KEYWORDS: Array<[RegExp, string]> = [
  [/\bnavy\b/i, "Blu navy"],
  [/\bblu\b/i, "Blu"],
  [/\bblue\b/i, "Blu"],
  [/\brosso\b/i, "Rosso"],
  [/\bred\b/i, "Rosso"],
  [/\bbianc[oa]\b/i, "Bianco"],
  [/\bwhite\b/i, "Bianco"],
  [/\bner[oa]\b/i, "Nero"],
  [/\bblack\b/i, "Nero"],
  [/\bgold\b/i, "Oro"],
  [/\bdorat[oaie]\b/i, "Oro"],
  [/\bargento\b/i, "Argento"],
  [/\bsilver\b/i, "Argento"],
]

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
  if (requestOrigin.includes("localhost") || requestOrigin.includes("127.0.0.1")) {
    return requestOrigin
  }

  return SITE_URL
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
    return normalizedIdentifier(`${getProductSupplierSettings(product).brand}-${product.supplier_sku}`)
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

function getColor(product: StoreProduct) {
  if (product.color_name) return product.color_name

  const productText = `${product.name} ${product.description || ""}`
  const colors = COLOR_KEYWORDS
    .filter(([pattern]) => pattern.test(productText))
    .map(([, color]) => color)

  return [...new Set(colors)].join(" / ") || "Multicolore"
}

function renderReturnPolicy(baseUrl: string) {
  return [
    "      <g:returns>",
    "        <g:country>IT</g:country>",
    "        <g:item_condition>NEW</g:item_condition>",
    "        <g:window_days>14</g:window_days>",
    "        <g:window_type>FINITE_RETURN_WINDOW</g:window_type>",
    "        <g:method>BY_MAIL</g:method>",
    "        <g:outcome>REFUND</g:outcome>",
    "        <g:shipping_fee>0.00 EUR</g:shipping_fee>",
    "        <g:shipping_fee_type>DEDUCTED_FROM_REFUND</g:shipping_fee_type>",
    "        <g:restocking_fee>0.00 EUR</g:restocking_fee>",
    `        <g:policy_url>${escapeXml(absoluteUrl(RETURN_POLICY_PATH, baseUrl))}</g:policy_url>`,
    "      </g:returns>",
  ].join("\n")
}

async function getCatalogProducts() {
  try {
    const supabase = await createClient()
    let { data, error } = await supabase
      .from("products")
      .select(CATALOG_SELECT)
      .order("created_at", { ascending: false })

    if (error) {
      const preSupplierResult = await supabase
        .from("products")
        .select(PRE_SUPPLIER_CATALOG_SELECT)
        .order("created_at", { ascending: false })
      data = preSupplierResult.data as typeof data
      error = preSupplierResult.error
    }

    if (error?.message.includes("stock_by_size")) {
      const legacyResult = await supabase
        .from("products")
        .select(LEGACY_CATALOG_SELECT)
        .order("created_at", { ascending: false })
      data = legacyResult.data as typeof data
      error = legacyResult.error
    }

    if (error) throw error

    return withDemoProducts((data || []) as StoreProduct[])
  } catch (error) {
    console.error("Google Merchant feed: catalogo Supabase non disponibile.", error)
    return []
  }
}

function renderProductVariant(product: StoreProduct, size: string, baseUrl: string) {
  const itemId = getMerchantItemId(product, size)
  const productUrl = absoluteUrl(`/prodotto/${encodeURIComponent(product.id)}`, baseUrl)
  const primaryImage = product.image_url ? absoluteUrl(product.image_url, baseUrl) : ""
  const additionalImages = getAdditionalImages(product, baseUrl, primaryImage)
  const categoryKey = product.category.toLowerCase()
  const color = getColor(product)
  const titleParts = [product.name, color, `Taglia ${size}`].filter(Boolean)
  const title = titleParts.join(" - ")
  const description = product.description || `${product.name} disponibile su MIRAI LAB STORE.`
  const supplierSettings = getProductSupplierSettings(product)
  const brand = supplierSettings.brand
  const itemGroupId = getItemGroupId(product)
  const productType = PRODUCT_TYPE_BY_STORE_CATEGORY[categoryKey] || `Abbigliamento > ${product.category}`
  const googleCategory = GOOGLE_CATEGORY_BY_STORE_CATEGORY[categoryKey] || "166"
  const availability = getAvailability(product, size)
  const isHeadwear = HEADWEAR_CATEGORIES.has(categoryKey)

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
    ...(supplierSettings.gtin ? [`      <g:gtin>${escapeXml(supplierSettings.gtin)}</g:gtin>`] : []),
    ...(supplierSettings.mpn ? [`      <g:mpn>${escapeXml(supplierSettings.mpn)}</g:mpn>`] : []),
    `      <g:identifier_exists>${supplierSettings.gtin || supplierSettings.mpn ? "yes" : "no"}</g:identifier_exists>`,
    `      <g:google_product_category>${googleCategory}</g:google_product_category>`,
    `      <g:product_type>${escapeXml(productType)}</g:product_type>`,
    `      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>`,
    `      <g:item_group_title>${escapeXml(product.name)}</g:item_group_title>`,
    `      <g:size>${escapeXml(size)}</g:size>`,
    `      <g:size_system>${isHeadwear ? "US" : "EU"}</g:size_system>`,
    isHeadwear ? "" : "      <g:size_type>regular</g:size_type>",
    `      <g:color>${escapeXml(color)}</g:color>`,
    "      <g:gender>unisex</g:gender>",
    "      <g:age_group>adult</g:age_group>",
    "      <g:adult>no</g:adult>",
    "      <g:excluded_destination>Local_inventory_ads</g:excluded_destination>",
    "      <g:excluded_destination>Free_local_listings</g:excluded_destination>",
    product.is_new ? "      <g:custom_label_0>Nuovi arrivi</g:custom_label_0>" : "",
    "      <g:shipping>",
    "        <g:country>IT</g:country>",
    "        <g:service>Standard</g:service>",
    "        <g:price>0.00 EUR</g:price>",
    ...(supplierSettings.shippingMinDays !== undefined && supplierSettings.shippingMaxDays !== undefined
      ? [
          "        <g:min_handling_time>0</g:min_handling_time>",
          "        <g:max_handling_time>0</g:max_handling_time>",
          `        <g:min_transit_time>${supplierSettings.shippingMinDays}</g:min_transit_time>`,
          `        <g:max_transit_time>${supplierSettings.shippingMaxDays}</g:max_transit_time>`,
        ]
      : []),
    "      </g:shipping>",
    renderReturnPolicy(baseUrl),
    "    </item>",
  ].filter(Boolean).join("\n")
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const catalogProducts = await getCatalogProducts()
  const products = catalogProducts.filter(
    (product) => product.image_url && Number(product.price) > 0 && !isPrivateCheckoutProduct(product),
  )
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

  const etag = `"${createHash("sha256").update(xml).digest("hex")}"`
  const latestProductUpdate = catalogProducts
    .map((product) => Date.parse((product as StoreProduct & { updated_at?: string }).updated_at || product.created_at))
    .filter(Number.isFinite)
    .reduce((latest, timestamp) => Math.max(latest, timestamp), 0)
  const lastModified = latestProductUpdate > 0
    ? new Date(latestProductUpdate).toUTCString()
    : new Date().toUTCString()
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300, must-revalidate",
    "ETag": etag,
    "Last-Modified": lastModified,
    "X-Robots-Tag": "noindex",
  }

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers })
  }

  return new Response(xml, {
    status: 200,
    headers,
  })
}
