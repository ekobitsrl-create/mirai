import { CUSTOM_TEE_IMAGE, CUSTOM_TEE_PRICE, CUSTOM_TEE_PRODUCT_ID } from "@/lib/customization"

type ProductIdentity = {
  name?: string | null
  image_url?: string | null
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
  supplier_sku?: string
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
    supplier_sku: (row.supplier_sku as string) ?? undefined,
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
