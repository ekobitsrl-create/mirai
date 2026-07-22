import { CUSTOM_TEE_IMAGE, CUSTOM_TEE_PRICE, CUSTOM_TEE_PRODUCT_ID } from "@/lib/customization"

type ProductIdentity = {
  name?: string | null
  image_url?: string | null
}

export type SupplierProfile = "minimal" | "mirai"

type SupplierProduct = {
  supplier_profile?: SupplierProfile | string | null
  brand?: string | null
  gtin?: string | null
  supplier_sku?: string | null
  shipping_min_days?: number | null
  shipping_max_days?: number | null
}

export const SUPPLIER_PROFILE_OPTIONS: Record<SupplierProfile, {
  label: string
  brand: string
  hasGtin: boolean
  merchantCustomLabel4?: string
  shippingLabel?: string
  shippingMinDays?: number
  shippingMaxDays?: number
}> = {
  minimal: {
    label: "Minimal / impostazione attuale",
    brand: "Minimal",
    hasGtin: true,
  },
  mirai: {
    label: "MIRAI / altro fornitore",
    brand: "MIRAI",
    hasGtin: false,
    merchantCustomLabel4: "catalogo_Mirai",
    shippingLabel: "spedizione_7_12",
    shippingMinDays: 7,
    shippingMaxDays: 12,
  },
}

export function getSupplierProfile(product: SupplierProduct): SupplierProfile {
  if (product.supplier_profile === "minimal" || product.supplier_profile === "mirai") {
    return product.supplier_profile
  }

  return /^minimal(?:\s|$)/i.test(product.brand?.trim() || "") ? "minimal" : "mirai"
}

export function getProductSupplierSettings(product: SupplierProduct) {
  const profile = getSupplierProfile(product)
  const defaults = SUPPLIER_PROFILE_OPTIONS[profile]
  const supplierSku = product.supplier_sku?.trim() || undefined
  const gtin = defaults.hasGtin ? product.gtin?.trim() || undefined : undefined
  const shippingMinDays = product.shipping_min_days !== null
    && product.shipping_min_days !== undefined
    && Number.isFinite(Number(product.shipping_min_days))
      ? Number(product.shipping_min_days)
      : defaults.shippingMinDays
  const shippingMaxDays = product.shipping_max_days !== null
    && product.shipping_max_days !== undefined
    && Number.isFinite(Number(product.shipping_max_days))
      ? Number(product.shipping_max_days)
      : defaults.shippingMaxDays

  return {
    profile,
    brand: profile === "mirai" ? "MIRAI" : product.brand?.trim() || defaults.brand,
    gtin,
    mpn: supplierSku,
    merchantCustomLabel4: defaults.merchantCustomLabel4,
    shippingLabel: defaults.shippingLabel,
    shippingMinDays,
    shippingMaxDays,
  }
}

export type StoreProductImage = {
  src: string
  alt: string
  fit?: "contain" | "cover"
  position?: string
}

export type StoreProduct = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  sizes: string[]
  in_stock: boolean
  is_new: boolean
  created_at: string
  brand?: string
  supplier_profile?: SupplierProfile
  supplier_sku?: string
  gtin?: string
  shipping_min_days?: number
  shipping_max_days?: number
  color_name?: string
  color_hex?: string
  fit_note?: string
  detail_items?: string[]
  composition?: string
  care?: string
  stock_by_size?: Record<string, number>
  image_gallery?: StoreProductImage[]
}

// The private-checkout hoodie now lives in Supabase with this fixed id so it stays
// identifiable (hidden from listings/feeds) after the migration away from hardcoded data.
export const PRIVATE_CHECKOUT_PRODUCT_ID = "a0000000-0000-4000-8000-000000000017"

// The Custom Lab tee is generated on the fly (dynamic price/customization), so it is the
// only product that is NOT stored in the database.
export const CUSTOM_TEE_PRODUCT: StoreProduct = {
  id: CUSTOM_TEE_PRODUCT_ID,
  name: "MIRAI Custom Heavy Tee",
  description: "T-shirt heavyweight oversize personalizzata nel MIRAI Custom Lab. Una stampa fronte o retro inclusa.",
  price: CUSTOM_TEE_PRICE,
  category: "custom",
  image_url: CUSTOM_TEE_IMAGE,
  sizes: ["S", "M", "L", "XL", "XXL"],
  in_stock: true,
  is_new: true,
  created_at: "2026-07-16T12:00:00.000Z",
  brand: "MIRAI",
  supplier_profile: "mirai",
  shipping_min_days: 7,
  shipping_max_days: 12,
  color_name: "Personalizzato",
  color_hex: "#f4f1e9",
  fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
}

const BLACK_ISLAND_PATTERN = /black[\s_-]*island/i

export function isBlackIslandProduct(product: ProductIdentity) {
  return BLACK_ISLAND_PATTERN.test(product.name || "")
    || BLACK_ISLAND_PATTERN.test(product.image_url || "")
}

export function isPrivateCheckoutProduct(product: ProductIdentity & { id?: string | null }) {
  return product.id === PRIVATE_CHECKOUT_PRODUCT_ID
}

export function withoutBlackIslandProducts<T extends ProductIdentity>(products: T[]) {
  return products.filter((product) => !isBlackIslandProduct(product))
}

/**
 * Normalizes a raw Supabase products row into a StoreProduct. Handles nullable
 * columns and JSON(b) fields (stock_by_size, image_gallery) coming back from the API.
 */
export function mapProductRow(row: Record<string, any>): StoreProduct {
  const rawGallery = row.image_gallery
  const rawStock = row.stock_by_size
  const rawDetails = row.detail_items

  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    description: (row.description as string | null) ?? null,
    price: Number(row.price ?? 0),
    category: (row.category as string) ?? "",
    image_url: (row.image_url as string | null) ?? null,
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : [],
    in_stock: Boolean(row.in_stock),
    is_new: Boolean(row.is_new),
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    brand: (row.brand as string) ?? undefined,
    supplier_profile:
      row.supplier_profile === "minimal" || row.supplier_profile === "mirai"
        ? row.supplier_profile
        : undefined,
    supplier_sku: (row.supplier_sku as string) ?? undefined,
    gtin: (row.gtin as string) ?? undefined,
    shipping_min_days:
      row.shipping_min_days === null || row.shipping_min_days === undefined
        ? undefined
        : Number(row.shipping_min_days),
    shipping_max_days:
      row.shipping_max_days === null || row.shipping_max_days === undefined
        ? undefined
        : Number(row.shipping_max_days),
    color_name: (row.color_name as string) ?? undefined,
    color_hex: (row.color_hex as string) ?? undefined,
    fit_note: (row.fit_note as string) ?? undefined,
    detail_items: Array.isArray(rawDetails) ? (rawDetails as string[]) : undefined,
    composition: (row.composition as string) ?? undefined,
    care: (row.care as string) ?? undefined,
    stock_by_size:
      rawStock && typeof rawStock === "object" && !Array.isArray(rawStock)
        ? (rawStock as Record<string, number>)
        : undefined,
    image_gallery: Array.isArray(rawGallery) ? (rawGallery as StoreProductImage[]) : undefined,
  }
}

/**
 * Normalizes and filters a list of database product rows for public display.
 * (Named `withDemoProducts` for backwards compatibility with existing callers;
 * demo/hardcoded products no longer exist — everything comes from the database.)
 */
export function withDemoProducts(products: Array<Record<string, any>>): StoreProduct[] {
  return withoutBlackIslandProducts(products.map(mapProductRow))
}

/**
 * Returns a product that is not stored in the database. Currently this is only the
 * dynamically generated Custom Lab tee.
 */
export function getDemoProduct(id: string): StoreProduct | null {
  if (id === CUSTOM_TEE_PRODUCT_ID) return CUSTOM_TEE_PRODUCT
  return null
}
