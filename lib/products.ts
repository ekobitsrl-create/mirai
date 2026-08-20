import { CUSTOM_TEE_IMAGE, CUSTOM_TEE_PRICE, CUSTOM_TEE_PRODUCT_ID } from "@/lib/customization"
import { HEADWEAR_GENERATED_GALLERIES } from "@/lib/headwear-generated-galleries"

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
  merchantCustomLabel3?: string
  merchantCustomLabel4?: string
  shippingLabel?: string
  shippingMinDays?: number
  shippingMaxDays?: number
}> = {
  minimal: {
    label: "Minimal / impostazione attuale",
    brand: "Minimal",
    hasGtin: true,
    merchantCustomLabel3: "catalogo_2",
    shippingLabel: "spedizione_3_5",
  },
  mirai: {
    label: "MIRAI / altro fornitore",
    brand: "MIRAI",
    hasGtin: false,
    merchantCustomLabel4: "catalogo_2",
    shippingLabel: "spedizione_7_12",
    shippingMinDays: 7,
    shippingMaxDays: 12,
  },
}

export function hasMinimalMerchantBrand(product: Pick<SupplierProduct, "brand">) {
  const brand = product.brand?.trim().toLocaleLowerCase("it") || ""
  return brand === "minimal" || brand === "minimal couture"
}

export function getSupplierProfile(product: SupplierProduct): SupplierProfile {
  if (product.supplier_profile === "minimal" || product.supplier_profile === "mirai") {
    return product.supplier_profile
  }

  return hasMinimalMerchantBrand(product) ? "minimal" : "mirai"
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
    merchantCustomLabel3: defaults.merchantCustomLabel3,
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
  is_published?: boolean
  community_only?: boolean
  is_preorder?: boolean
  preorder_release_at?: string
  drop_name?: string
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
  is_published: true,
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
const PRODUCT_DESCRIPTION_CORRECTIONS: Array<[RegExp, string]> = [
  [/\bperle gold sparsi\b/gi, "perle gold sparse"],
]

const PRODUCT_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "4c89683d-939d-427a-8a34-3e00f9509d1e": "Cappello New Era 59FIFTY rosso personalizzato a mano con applicazioni di borchie sferiche dorate. Il logo NY ricamato in bianco è stato impreziosito da un contorno completo di micro-borchie gold, che ne esalta la forma e crea un forte effetto gioiello.",
  "dc89f425-f02a-44e6-9694-b8131baed774": "Cappello New Era 59FIFTY Los Angeles in tonalità bianco ghiaccio, personalizzato artigianalmente con applicazioni dorate. Il logo LA ricamato è stato interamente contornato da micro-borchie gold, applicate una ad una per creare un raffinato effetto gioiello. La visiera presenta una lavorazione distressed sui bordi ed è impreziosita da borchie dorate di diverse dimensioni, distribuite in modo irregolare per un risultato ancora più esclusivo.",
  "d7304772-f3df-4ad3-84b0-b2039f9812a1": "Cappello New Era 59FIFTY New York nero personalizzato artigianalmente con una lavorazione distressed e applicazioni metalliche dorate.\n\nIl logo NY ricamato in bianco è evidenziato da una fitta cornice di micro-borchie sferiche color oro, applicate singolarmente lungo tutto il profilo delle lettere. La combinazione di borchie piccole e più grandi crea volume, luminosità e un marcato effetto gioiello. Ulteriori borchie bombate, disposte in piccoli gruppi sulla corona e sulla visiera, completano la personalizzazione con un risultato irregolare e ricercato.\n\nLa lavorazione distressed è visibile nelle cuciture e nei bordi volutamente consumati e leggermente sfilacciati, che conferiscono al cappello un aspetto vissuto, ruvido e autenticamente streetwear.",
  "b7629ec4-34d2-428b-b0d8-ccfd9317de99": "Cappello New Era 59FIFTY Los Angeles in azzurro pastello, personalizzato artigianalmente con una lavorazione distressed e applicazioni metalliche color argento.\n\nIl logo LA ricamato in bianco è interamente rifinito con micro-borchie sferiche argentate, applicate una ad una lungo il profilo delle lettere per creare un effetto tridimensionale, luminoso e prezioso.\n\nLa visiera è decorata con borchie bombate di diverse dimensioni, distribuite in modo irregolare per dare movimento e carattere al design. Ulteriori dettagli metallici sono applicati lungo le cuciture e sulla corona.\n\nLa lavorazione distressed si concentra soprattutto sul bordo della visiera e sulle cuciture, volutamente consumate e leggermente sfilacciate, per donare al cappello un aspetto vissuto e autenticamente streetwear.",
  "835cb227-c4f9-48db-88a2-d8a0ac021c66": "Cappello New Era 59FIFTY New York nero personalizzato artigianalmente con cristalli rossi applicati a mano.\n\nIl logo NY ricamato in bianco è stato completamente impreziosito da una fitta composizione di strass rossi, posizionati uno ad uno per seguire la forma delle lettere e creare un effetto luminoso e tridimensionale. Il contrasto tra il nero del cappello, il ricamo bianco e il rosso brillante rende il design deciso e immediatamente riconoscibile.\n\nA completare il custom sono presenti dettagli ricamati laterali, tra cui una patch grafica e un piccolo simbolo ispirato al mondo del baseball.",
}

function normalizeProductDescription(
  description: string | null | undefined,
  productId?: string,
) {
  const value = productId ? PRODUCT_DESCRIPTION_OVERRIDES[productId] || description : description
  if (!value) return null

  return PRODUCT_DESCRIPTION_CORRECTIONS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    value,
  )
}

export function isBlackIslandProduct(product: ProductIdentity) {
  return BLACK_ISLAND_PATTERN.test(product.name || "")
    || BLACK_ISLAND_PATTERN.test(product.image_url || "")
}

export function isPrivateCheckoutProduct(product: ProductIdentity & { id?: string | null }) {
  return product.id === PRIVATE_CHECKOUT_PRODUCT_ID
}

export function isProductPublished(product: { is_published?: boolean | null }) {
  return product.is_published !== false
}

export function isCommunityOnlyProduct(product: { community_only?: boolean | null }) {
  return product.community_only === true
}

export function canAccessStoreProduct(
  product: { is_published?: boolean | null; community_only?: boolean | null },
  isCommunityMember: boolean,
) {
  return isProductPublished(product) && (!isCommunityOnlyProduct(product) || isCommunityMember)
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
  const productId = String(row.id)
  const productName = (row.name as string) ?? ""
  const databaseGallery: StoreProductImage[] = Array.isArray(rawGallery)
    ? rawGallery
        .map((image, index): StoreProductImage | null => {
          if (typeof image === "string" && image.trim()) {
            return {
              src: image.trim(),
              alt: index === 0 ? productName : `${productName} - immagine ${index + 1}`,
              fit: "contain",
            }
          }

          if (!image || typeof image !== "object" || typeof image.src !== "string" || !image.src.trim()) {
            return null
          }

          return {
            src: image.src.trim(),
            alt: typeof image.alt === "string" && image.alt.trim()
              ? image.alt.trim()
              : index === 0
                ? productName
                : `${productName} - immagine ${index + 1}`,
            fit: image.fit === "cover" ? "cover" : "contain",
            position: typeof image.position === "string" ? image.position : undefined,
          }
        })
        .filter((image): image is StoreProductImage => image !== null)
    : []
  const generatedGallery = HEADWEAR_GENERATED_GALLERIES[productId] || []
  const galleryWithOriginalPrimary = generatedGallery.length
    ? [
        ...(row.image_url
          ? [{
              src: row.image_url as string,
              alt: productName,
              fit: "cover" as const,
              position: "center",
            }]
          : []),
        ...databaseGallery,
        ...generatedGallery,
      ].filter(
        (image, index, gallery) =>
          image?.src && gallery.findIndex((candidate) => candidate?.src === image.src) === index,
      )
    : databaseGallery

  return {
    id: productId,
    name: productName,
    description: normalizeProductDescription(row.description as string | null, productId),
    price: Number(row.price ?? 0),
    category: (row.category as string) ?? "",
    image_url: (row.image_url as string | null) ?? null,
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : [],
    in_stock: Boolean(row.in_stock),
    is_new: Boolean(row.is_new),
    is_published: row.is_published !== false,
    community_only: Boolean(row.community_only),
    is_preorder: Boolean(row.is_preorder),
    preorder_release_at: (row.preorder_release_at as string) ?? undefined,
    drop_name: (row.drop_name as string) ?? undefined,
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
    image_gallery: galleryWithOriginalPrimary.length ? galleryWithOriginalPrimary : undefined,
  }
}

/**
 * Normalizes and filters a list of database product rows for public display.
 * (Named `withDemoProducts` for backwards compatibility with existing callers;
 * demo/hardcoded products no longer exist — everything comes from the database.)
 */
export function withDemoProducts(products: Array<Record<string, any>>): StoreProduct[] {
  return withoutBlackIslandProducts(products.map(mapProductRow)).filter(isProductPublished)
}

/**
 * Returns a product that is not stored in the database. Currently this is only the
 * dynamically generated Custom Lab tee.
 */
export function getDemoProduct(id: string): StoreProduct | null {
  if (id === CUSTOM_TEE_PRODUCT_ID) return CUSTOM_TEE_PRODUCT
  return null
}
