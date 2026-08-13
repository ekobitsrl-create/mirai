import type { NextRequest } from "next/server"
import { createHash } from "node:crypto"
import {
  getProductSupplierSettings,
  getSupplierProfile,
  isPrivateCheckoutProduct,
  withDemoProducts,
  type StoreProduct,
  type SupplierProfile,
} from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"
import { getCatalogItemId, normalizeCatalogIdentifier } from "@/lib/catalog-identifiers"
import { getShippingCostCents, SHIPPING_CONFIG } from "@/lib/shipping"
import { localizeColor, localizeProduct } from "@/lib/catalog-localization"
import { HTML_LOCALES, localizedOrganicPath } from "@/lib/international-seo"
import type { Locale } from "@/lib/translations"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RETURN_POLICY_PATH = "/resi"
const MERCHANT_FEED_LOCALES: Locale[] = ["it", "en", "es", "de", "fr"]
const CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at, brand, supplier_profile, supplier_sku, gtin, shipping_min_days, shipping_max_days, color_name, color_hex, image_gallery, detail_items, composition"
const PRE_SUPPLIER_CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at, brand, supplier_sku, color_name, color_hex, image_gallery, detail_items, composition"
const LEGACY_CATALOG_SELECT = "id, name, description, price, category, image_url, sizes, stock_by_size, in_stock, is_new, created_at, updated_at"

const GOOGLE_CATEGORY_BY_STORE_CATEGORY: Record<string, string> = {
  "t-shirt": "212",
  tshirt: "212",
  magliette: "212",
  camicie: "212",
  canotte: "212",
  jeans: "204",
  pantaloni: "204",
  shorts: "207",
  bermuda: "207",
  headwear: "173",
  cappelli: "173",
  caps: "173",
  hats: "173",
  felpe: "212",
  profumi: "479",
}

const PRODUCT_TYPE_BY_STORE_CATEGORY: Record<string, string> = {
  "t-shirt": "Abbigliamento > T-shirt",
  tshirt: "Abbigliamento > T-shirt",
  magliette: "Abbigliamento > T-shirt",
  camicie: "Abbigliamento > Camicie",
  canotte: "Abbigliamento > Canotte",
  jeans: "Abbigliamento > Jeans",
  pantaloni: "Abbigliamento > Pantaloni",
  shorts: "Abbigliamento > Bermuda e shorts",
  bermuda: "Abbigliamento > Bermuda e shorts",
  headwear: "Accessori > Cappelli personalizzati",
  cappelli: "Accessori > Cappelli personalizzati",
  caps: "Accessori > Cappelli personalizzati",
  hats: "Accessori > Cappelli personalizzati",
  felpe: "Abbigliamento > Felpe e hoodie",
  profumi: "Bellezza e cura della persona > Profumi",
}

const HEADWEAR_CATEGORIES = new Set(["headwear", "cappelli", "caps", "hats"])
const TSHIRT_CATEGORIES = new Set(["t-shirt", "tshirt", "magliette"])
const GOOGLE_ADS_CAMPAIGN_LABEL = "campagna_selezionati"
const GOOGLE_ADS_SELECTED_SUPPLIER_SKUS = new Set([
  "M.0089",
  "M.0230",
  "M.0254",
  "M.0255",
  "M.0268",
  "MIRAI-VALLEY-SHORT-BRN-030",
  "MIRAI-VALLEY-SHORT-BLK-031",
  "MIRAI-VALLEY-SHORT-BLU-032",
])

type MerchantCopyOverride = {
  title: string
  description: string
}

const GOOGLE_ADS_MERCHANT_COPY_BY_PRODUCT_ID: Record<string, MerchantCopyOverride> = {
  "93638035-fc17-4d46-b4a0-c4129cd54d42": {
    title: "Bermuda Denim Streetwear con Strass e Perle Minimal Couture",
    description: "Bermuda streetwear Minimal Couture in denim blu con costruzione cinque tasche. Strass e perle sono distribuiti sul fronte e aggiungono una finitura luminosa al lavaggio denim. Il modello mantiene una linea pulita e versatile, adatta ad abbinamenti urban e oversize. Colore denim blu, dettagli applicati sul davanti e chiusura classica in vita.",
  },
  "3e3acd47-bb56-495a-9ddd-f89d60d003ec": {
    title: "Bermuda Camouflage con Cristalli Minimal Couture",
    description: "Bermuda streetwear Minimal Couture in tessuto camouflage woodland multicolore. Cristalli e pietre colorate applicati sul fronte valorizzano la fantasia military senza coprirne il disegno. La linea ampia e rilassata favorisce il comfort e crea un volume adatto a look urban. Modello con passanti in vita, tasche e lunghezza al ginocchio.",
  },
  "2f1ae414-2e5c-45e4-8db9-67034e173be5": {
    title: "Bermuda Denim Streetwear con Strass Laterali Minimal Couture",
    description: "Bermuda Minimal Couture in denim nero con lavaggio washed e costruzione cinque tasche. Le applicazioni di strass disposte lungo entrambi i lati creano una finitura luminosa mantenendo pulita la parte centrale. Il taglio regolare e la lunghezza al ginocchio rendono il modello adatto a outfit streetwear. Colore nero slavato con dettagli crystal laterali.",
  },
  "8e0ff625-3cbc-4ad8-8470-5c66c9b8ecf9": {
    title: "Bermuda Denim Streetwear con Applicazioni Minimal Couture",
    description: "Bermuda Minimal Couture in denim blu con lavaggio sfumato e costruzione cinque tasche. Le applicazioni luminose seguono i lati del capo e aggiungono texture senza alterare la linea regolare. La lunghezza al ginocchio e la tonalità blu washed lo rendono adatto ad abbinamenti streetwear quotidiani. Colore blu slavato con dettagli applicati lateralmente.",
  },
  "95e77b7a-90b6-4b12-9b03-63f0f97cf286": {
    title: "Bermuda Denim Streetwear con Cristalli Minimal Couture",
    description: "Bermuda Minimal Couture in denim marrone con lavaggio washed e applicazioni crystal sfumate lungo entrambi i lati. La tonalità calda mette in risalto i dettagli luminosi, mentre la costruzione in denim mantiene il carattere streetwear del modello. Lunghezza al ginocchio, vita con passanti e tasche. Colore marrone slavato con cristalli laterali.",
  },
  "824c2ce3-95d1-4e52-8455-f681379c4071": {
    title: "Canotta Oversize Streetwear Crown Minimal Couture",
    description: "Canotta oversize Minimal Couture in cotone verde washed con stampa Crown sul fronte. La grafica combina corona, occhio e dadi, mentre il lavaggio vissuto e le finiture distressed rafforzano l'estetica streetwear. Il giromanica ampio e la silhouette rilassata favoriscono libertà di movimento e layering. Colore verde slavato con stampa grafica frontale.",
  },
  "8f21753c-398d-476e-9368-e073757ae61b": {
    title: "Canotta Oversize Streetwear Eagle Minimal Couture",
    description: "Canotta oversize Minimal Couture in cotone bordeaux con stampa Eagle sul fronte. La grafica con aquila e fiamme si abbina al lavaggio vissuto del tessuto, creando un aspetto streetwear deciso. Il giromanica ampio e la linea rilassata rendono il capo adatto alla stagione estiva e al layering. Colore bordeaux con stampa grafica frontale.",
  },
  "35d2db43-37ad-4ccf-9a41-8d136012f6b5": {
    title: "Canotta Oversize Streetwear Liberty Speed",
    description: "Canotta oversize MIRAI in cotone nero slavato con taglio smanicato. La grafica urban dedicata alla Statua della Libertà è presente sul fronte, mentre il retro è caratterizzato da un maxi simbolo coordinato. La silhouette ampia è pensata per layering e outfit estivi streetwear. Colore nero washed, stampa fronte-retro e giromanica ampio.",
  },
  "86711f4d-82f9-4ec8-85d2-1fa1f6deadde": {
    title: "Bermuda Baggy Streetwear con Cristalli Night Spark",
    description: "Bermuda MIRAI Night Spark nero dal taglio ampio e baggy, con lavaggio sfumato e applicazioni di cristalli distribuite su tutta la superficie. La texture luminosa caratterizza il capo senza aggiungere grafiche, mentre i lacci lunghi completano la costruzione streetwear. Colore nero, lunghezza al ginocchio e vestibilità rilassata.",
  },
  "9ee8e00d-08be-4523-b02e-e617c84c38d5": {
    title: "Canotta Oversize Streetwear Santa Madre con Borchie",
    description: "Canotta oversize Minimal Santa Madre in cotone bianco con lettering rosso sul fronte. Le applicazioni metalliche lungo il girocollo aggiungono un dettaglio luminoso alla linea essenziale, mentre le spalle ampie definiscono la silhouette streetwear. Colore bianco, stampa frontale Santa Madre, giromanica ampio e finiture metalliche sul collo.",
  },
  "1a05047e-bf92-49c6-939d-34f7b4d7f393": {
    title: "Bermuda Baggy Denim Patchwork Valley",
    description: "Bermuda MIRAI Valley in denim nero washed con silhouette baggy e lunghezza al ginocchio. Patch multicolore, maxi lettering applicato e dettagli crystal costruiscono una superficie ricca ma coerente. I lacci lunghi completano la linea streetwear e consentono di regolare la vita. Colore nero slavato con patchwork, lettering e applicazioni luminose.",
  },
  "1e1a5d1b-249f-4e5a-9ec4-921291c6fc1e": {
    title: "Bermuda Baggy Denim Patchwork Valley",
    description: "Bermuda MIRAI Valley in denim blu washed con silhouette ampia e baggy. Patch ricamate, maxi lettering applicato e dettagli crystal animano il fronte mantenendo riconoscibile il lavaggio denim. I lacci extra long completano l'estetica urban e regolano la vita. Colore blu slavato, lunghezza al ginocchio e finiture patchwork multicolore.",
  },
  "4a178ecb-500d-4e95-a83f-08fe90818e36": {
    title: "Bermuda Baggy Denim Patchwork Valley",
    description: "Bermuda MIRAI Valley in denim marrone washed con taglio lungo e rilassato. Patch multicolore, maxi lettering applicato e dettagli crystal valorizzano il fronte, mentre la silhouette baggy mantiene il volume tipico dello streetwear. I lacci lunghi permettono di regolare la vita. Colore marrone slavato con patchwork e applicazioni luminose.",
  },
}

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

function getItemGroupId(product: StoreProduct) {
  if (product.supplier_sku) {
    return normalizeCatalogIdentifier(`${getProductSupplierSettings(product).brand}-${product.supplier_sku}`)
  }

  return normalizeCatalogIdentifier(product.id).slice(0, 50)
}

function getSizes(product: StoreProduct) {
  const sizes = (product.sizes || []).filter(Boolean)
  return sizes.length > 0 ? sizes : ["OS"]
}

const LOCALIZED_PRODUCT_TYPES: Record<Exclude<Locale, "it">, Record<string, string>> = {
  en: { "t-shirt": "Clothing > T-shirts", tshirt: "Clothing > T-shirts", magliette: "Clothing > T-shirts", camicie: "Clothing > Shirts", canotte: "Clothing > Tank tops", jeans: "Clothing > Jeans", pantaloni: "Clothing > Trousers", shorts: "Clothing > Shorts", bermuda: "Clothing > Shorts", headwear: "Accessories > Custom caps", cappelli: "Accessories > Custom caps", caps: "Accessories > Custom caps", hats: "Accessories > Custom caps", felpe: "Clothing > Sweatshirts & Hoodies", profumi: "Beauty & Personal Care > Perfume" },
  es: { "t-shirt": "Ropa > Camisetas", tshirt: "Ropa > Camisetas", magliette: "Ropa > Camisetas", camicie: "Ropa > Camisas", canotte: "Ropa > Camisetas sin mangas", jeans: "Ropa > Vaqueros", pantaloni: "Ropa > Pantalones", shorts: "Ropa > Bermudas", bermuda: "Ropa > Bermudas", headwear: "Accesorios > Gorras personalizadas", cappelli: "Accesorios > Gorras personalizadas", caps: "Accesorios > Gorras personalizadas", hats: "Accesorios > Gorras personalizadas", felpe: "Ropa > Sudaderas y hoodies", profumi: "Belleza y cuidado personal > Perfumes" },
  de: { "t-shirt": "Bekleidung > T-Shirts", tshirt: "Bekleidung > T-Shirts", magliette: "Bekleidung > T-Shirts", camicie: "Bekleidung > Hemden", canotte: "Bekleidung > Tanktops", jeans: "Bekleidung > Jeans", pantaloni: "Bekleidung > Hosen", shorts: "Bekleidung > Shorts", bermuda: "Bekleidung > Shorts", headwear: "Accessoires > Individuelle Caps", cappelli: "Accessoires > Individuelle Caps", caps: "Accessoires > Individuelle Caps", hats: "Accessoires > Individuelle Caps", felpe: "Bekleidung > Sweatshirts & Hoodies", profumi: "Körperpflege > Parfum" },
  fr: { "t-shirt": "Vêtements > T-shirts", tshirt: "Vêtements > T-shirts", magliette: "Vêtements > T-shirts", camicie: "Vêtements > Chemises", canotte: "Vêtements > Débardeurs", jeans: "Vêtements > Jeans", pantaloni: "Vêtements > Pantalons", shorts: "Vêtements > Bermudas", bermuda: "Vêtements > Bermudas", headwear: "Accessoires > Casquettes personnalisées", cappelli: "Accessoires > Casquettes personnalisées", caps: "Accessoires > Casquettes personnalisées", hats: "Accessoires > Casquettes personnalisées", felpe: "Vêtements > Sweats et hoodies", profumi: "Beauté et soins personnels > Parfums" },
}

const SIZE_LABELS: Record<Locale, string> = {
  it: "Taglia",
  en: "Size",
  es: "Talla",
  de: "Größe",
  fr: "Taille",
}

const FEED_DESCRIPTIONS: Record<Locale, string> = {
  it: "Catalogo prodotti MIRAI LAB STORE per Google Merchant Center",
  en: "MIRAI LAB STORE product catalogue for Google Merchant Center",
  es: "Catálogo de productos MIRAI LAB STORE para Google Merchant Center",
  de: "MIRAI LAB STORE Produktkatalog für Google Merchant Center",
  fr: "Catalogue produits MIRAI LAB STORE pour Google Merchant Center",
}

function normalizeInventoryQuantity(quantity: unknown) {
  const value = Number(quantity ?? 0)
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

function getProductInventory(product: StoreProduct) {
  if (!product.stock_by_size) return product.in_stock ? 1 : 0

  return getSizes(product).reduce(
    (total, size) => total + normalizeInventoryQuantity(product.stock_by_size?.[size]),
    0,
  )
}

function getVariantInventory(product: StoreProduct, size: string) {
  if (!product.stock_by_size) return getProductInventory(product)

  return normalizeInventoryQuantity(product.stock_by_size[size])
}

function getAvailability(product: StoreProduct, size: string) {
  const productInventory = getProductInventory(product)
  const variantInventory = getVariantInventory(product, size)
  return productInventory > 0 && variantInventory > 0 ? "in_stock" : "out_of_stock"
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

function getMaterial(product: StoreProduct) {
  const composition = product.composition?.trim()
  if (composition) return composition

  const category = product.category.toLowerCase()
  const productText = `${product.name} ${(product.detail_items || []).join(" ")}`

  if (/\bdenim\b/i.test(productText)) return "Denim"
  if (/\bcamouflage\b/i.test(productText)) return "Tessuto camouflage"
  if (["t-shirt", "tshirt", "magliette", "canotte"].includes(category)) return "Cotone"

  return null
}

function getPattern(product: StoreProduct) {
  const patternDetail = (product.detail_items || []).find((detail) =>
    /\b(grafica|stampa|fantasia|motivo|patchwork|lettering|logo)\b/i.test(detail),
  )

  if (!patternDetail) return null

  return patternDetail
    .replace(/^maxi\s+/i, "")
    .replace(/\s+(sul fronte|frontale|posteriore|coordinata)$/i, "")
    .trim()
}

function getMerchantDescription(
  product: StoreProduct,
  merchantProductName: string,
  color: string,
  pattern: string | null,
  material: string | null,
) {
  const baseDescription = product.description?.trim()
    || `${merchantProductName} disponibile su MIRAI LAB STORE.`
  const details: string[] = []

  if (!/\bcolore\s*:/i.test(baseDescription)) details.push(`Colore: ${color}.`)
  if (pattern && !/\bmotivo\s*:/i.test(baseDescription)) details.push(`Motivo: ${pattern}.`)
  if (material && !/\bmateriale\s*:/i.test(baseDescription)) details.push(`Materiale: ${material}.`)

  return [baseDescription, ...details].join(" ")
}

function getGoogleAdsCampaignLabel(product: StoreProduct) {
  const categoryKey = product.category.toLowerCase()
  const isSelectedSupplierProduct = Boolean(
    product.supplier_sku && GOOGLE_ADS_SELECTED_SUPPLIER_SKUS.has(product.supplier_sku.toUpperCase()),
  )
  const isMiraiOversizeTshirt = getSupplierProfile(product) === "mirai"
    && TSHIRT_CATEGORIES.has(categoryKey)
    && /^\s*t-?shirt\s+oversize\b/i.test(product.name)
  const isHeadwear = HEADWEAR_CATEGORIES.has(categoryKey)

  return isSelectedSupplierProduct || isMiraiOversizeTshirt || isHeadwear
    ? GOOGLE_ADS_CAMPAIGN_LABEL
    : null
}

function renderReturnPolicy(baseUrl: string) {
  return [
    "      <g:returns>",
    "        <g:country>IT</g:country>",
    "        <g:item_condition>NEW</g:item_condition>",
    "        <g:window_days>30</g:window_days>",
    "        <g:window_type>FINITE_RETURN_WINDOW</g:window_type>",
    "        <g:method>BY_MAIL</g:method>",
    "        <g:method>DROP_OFF_LOCATION</g:method>",
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

const META_DARKADS_ITEM_GROUP_IDS = new Set([
  "minimal-couture-m-0089",
  "mirai-mirai-liberty-008",
  "mirai-mirai-valley-short-blu-032",
  "4c89683d-939d-427a-8a34-3e00f9509d1e",
])

function renderProductVariant(
  product: StoreProduct,
  size: string,
  baseUrl: string,
  platform?: string | null,
  locale: Locale = "it",
) {
  const itemId = getCatalogItemId(product, size)
  const productPath = `/prodotto/${encodeURIComponent(product.id)}`
  const productUrl = absoluteUrl(localizedOrganicPath(productPath, locale), baseUrl)
  const primaryImage = product.image_url ? absoluteUrl(product.image_url, baseUrl) : ""
  const additionalImages = getAdditionalImages(product, baseUrl, primaryImage)
  const categoryKey = product.category.toLowerCase()
  const color = getColor(product)
  const material = getMaterial(product)
  const pattern = getPattern(product)
  const supplierSettings = getProductSupplierSettings(product)
  const italianMerchantProductName = supplierSettings.profile === "mirai"
    ? product.name.replace(/^MIRAI\s+/i, "").trim()
    : product.name
  const localizedProduct = localizeProduct(product, locale)
  const merchantProductName = locale === "it"
    ? italianMerchantProductName
    : localizedProduct.name.replace(/^MIRAI\s+/i, "").trim()
  const merchantCopyOverride = GOOGLE_ADS_MERCHANT_COPY_BY_PRODUCT_ID[product.id]
  const localizedColor = locale === "it" ? color : localizeColor(color, locale)
  const titleParts = [
    locale === "it" ? (merchantCopyOverride?.title || merchantProductName) : merchantProductName,
    localizedColor,
    `${SIZE_LABELS[locale]} ${size}`,
  ].filter(Boolean)
  const title = titleParts.join(" - ")
  const description = locale === "it"
    ? merchantCopyOverride?.description
      || getMerchantDescription(product, merchantProductName, color, pattern, material)
    : localizedProduct.description
  const brand = supplierSettings.brand
  const itemGroupId = getItemGroupId(product)
  const metaInternalLabel = platform === "meta" && META_DARKADS_ITEM_GROUP_IDS.has(itemGroupId)
    ? "darkads"
    : null
  const productType = locale === "it"
    ? PRODUCT_TYPE_BY_STORE_CATEGORY[categoryKey] || `Abbigliamento > ${product.category}`
    : LOCALIZED_PRODUCT_TYPES[locale][categoryKey] || localizedProduct.name
  const googleCategory = GOOGLE_CATEGORY_BY_STORE_CATEGORY[categoryKey] || "166"
  const inventory = getVariantInventory(product, size)
  const availability = getAvailability(product, size)
  const isHeadwear = HEADWEAR_CATEGORIES.has(categoryKey)
  const googleAdsCampaignLabel = getGoogleAdsCampaignLabel(product)

  return [
    "    <item>",
    `      <g:id>${escapeXml(itemId)}</g:id>`,
    `      <title>${escapeXml(title)}</title>`,
    `      <description>${escapeXml(description)}</description>`,
    `      <link>${escapeXml(productUrl)}</link>`,
    `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>`,
    ...additionalImages.map((image) => `      <g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`),
    `      <g:availability>${availability}</g:availability>`,
    ...(platform === "meta" ? [`      <g:inventory>${inventory}</g:inventory>`] : []),
    `      <g:price>${Number(product.price).toFixed(2)} EUR</g:price>`,
    "      <g:condition>new</g:condition>",
    `      <g:brand>${escapeXml(brand)}</g:brand>`,
    ...(supplierSettings.shippingLabel
      ? [`      <g:shipping_label>${escapeXml(supplierSettings.shippingLabel)}</g:shipping_label>`]
      : []),
    ...(supplierSettings.gtin ? [`      <g:gtin>${escapeXml(supplierSettings.gtin)}</g:gtin>`] : []),
    ...(supplierSettings.mpn ? [`      <g:mpn>${escapeXml(supplierSettings.mpn)}</g:mpn>`] : []),
    `      <g:identifier_exists>${supplierSettings.gtin || supplierSettings.mpn ? "yes" : "no"}</g:identifier_exists>`,
    `      <g:google_product_category>${googleCategory}</g:google_product_category>`,
    `      <g:product_type>${escapeXml(productType)}</g:product_type>`,
    `      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>`,
    `      <g:item_group_title>${escapeXml(merchantProductName)}</g:item_group_title>`,
    ...(metaInternalLabel
      ? [`      <g:internal_label>${escapeXml(metaInternalLabel)}</g:internal_label>`]
      : []),
    `      <g:size>${escapeXml(size)}</g:size>`,
    `      <g:size_system>${isHeadwear ? "US" : "EU"}</g:size_system>`,
    isHeadwear ? "" : "      <g:size_type>regular</g:size_type>",
    `      <g:color>${escapeXml(localizedColor)}</g:color>`,
    ...(material ? [`      <g:material>${escapeXml(material)}</g:material>`] : []),
    ...(pattern ? [`      <g:pattern>${escapeXml(pattern)}</g:pattern>`] : []),
    "      <g:gender>unisex</g:gender>",
    "      <g:age_group>adult</g:age_group>",
    "      <g:adult>no</g:adult>",
    "      <g:excluded_destination>Local_inventory_ads</g:excluded_destination>",
    "      <g:excluded_destination>Free_local_listings</g:excluded_destination>",
    product.is_new ? "      <g:custom_label_0>Nuovi arrivi</g:custom_label_0>" : "",
    ...(googleAdsCampaignLabel
      ? [`      <g:custom_label_2>${escapeXml(googleAdsCampaignLabel)}</g:custom_label_2>`]
      : []),
    ...(supplierSettings.merchantCustomLabel3
      ? [`      <g:custom_label_3>${escapeXml(supplierSettings.merchantCustomLabel3)}</g:custom_label_3>`]
      : []),
    ...(supplierSettings.merchantCustomLabel4
      ? [`      <g:custom_label_4>${escapeXml(supplierSettings.merchantCustomLabel4)}</g:custom_label_4>`]
      : []),
    ...SHIPPING_CONFIG.allowedCountries.flatMap((countryCode) => [
      "      <g:shipping>",
      `        <g:country>${countryCode}</g:country>`,
      "        <g:service>Standard</g:service>",
      `        <g:price>${(getShippingCostCents(countryCode) / 100).toFixed(2)} EUR</g:price>`,
      ...(supplierSettings.shippingMinDays !== undefined && supplierSettings.shippingMaxDays !== undefined
        ? [
            "        <g:min_handling_time>0</g:min_handling_time>",
            "        <g:max_handling_time>0</g:max_handling_time>",
            `        <g:min_transit_time>${supplierSettings.shippingMinDays}</g:min_transit_time>`,
            `        <g:max_transit_time>${supplierSettings.shippingMaxDays}</g:max_transit_time>`,
          ]
        : []),
      "      </g:shipping>",
    ]),
    renderReturnPolicy(baseUrl),
    "    </item>",
  ].filter(Boolean).join("\n")
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const requestedSupplier = request.nextUrl.searchParams.get("supplier")
  const requestedPlatform = request.nextUrl.searchParams.get("platform")
  const requestedLocale = request.nextUrl.searchParams.get("locale")
  const locale: Locale = MERCHANT_FEED_LOCALES.includes(requestedLocale as Locale)
    ? requestedLocale as Locale
    : "it"
  const supplierProfile: SupplierProfile | null = requestedSupplier === "minimal" || requestedSupplier === "mirai"
    ? requestedSupplier
    : null
  const platformLabel = requestedPlatform === "meta" ? "Meta Catalog" : "Google Merchant Center"
  const catalogProducts = await getCatalogProducts()
  const products = catalogProducts.filter(
    (product) => product.image_url
      && Number(product.price) > 0
      && !isPrivateCheckoutProduct(product)
      && (!supplierProfile || getSupplierProfile(product) === supplierProfile),
  )
  const items = products.flatMap((product) =>
    getSizes(product).map((size) => renderProductVariant(product, size, baseUrl, requestedPlatform, locale)),
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    `    <title>${supplierProfile ? `MIRAI LAB STORE - ${supplierProfile === "minimal" ? "Minimal" : "MIRAI"}` : "MIRAI LAB STORE"}${requestedPlatform === "meta" ? " - Meta" : ""}</title>`,
    `    <link>${escapeXml(absoluteUrl(localizedOrganicPath("/", locale), baseUrl))}</link>`,
    `    <language>${HTML_LOCALES[locale]}</language>`,
    `    <description>${escapeXml(FEED_DESCRIPTIONS[locale])}${supplierProfile ? ` - ${supplierProfile === "minimal" ? "Minimal" : "MIRAI"}` : ""}${requestedPlatform === "meta" ? ` - ${platformLabel}` : ""}</description>`,
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
    // Catalogue deletions must be visible on the very next Google/Meta fetch.
    // Keep ETag revalidation, but never serve a stale feed from the CDN.
    "Cache-Control": "public, max-age=0, s-maxage=0, must-revalidate",
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
