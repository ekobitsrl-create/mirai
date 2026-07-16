import { CUSTOM_TEE_IMAGE, CUSTOM_TEE_PRICE, CUSTOM_TEE_PRODUCT_ID } from "@/lib/customization"

type ProductIdentity = {
  name?: string | null
  image_url?: string | null
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
}

export const VALLEY_ATHLETIC_TEE: StoreProduct = {
  id: "71a11e7e-5b68-4e2c-9f65-0dca2b967104",
  name: "Valley Athletic Tee",
  description:
    "T-shirt heavyweight in cotone premium con fit oversize e stampa Valley Athletic. Collo a costine, spalla scesa e grafica frontale dal carattere varsity.",
  price: 69,
  category: "t-shirt",
  image_url: "/images/valley-athletic-tee.jpeg",
  sizes: ["S", "M", "L", "XL"],
  in_stock: true,
  is_new: true,
  created_at: "2026-07-15T12:00:00.000Z",
}

export const DEMO_PRODUCTS: StoreProduct[] = [VALLEY_ATHLETIC_TEE]

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
}

const BLACK_ISLAND_PATTERN = /black[\s_-]*island/i

export function isBlackIslandProduct(product: ProductIdentity) {
  return BLACK_ISLAND_PATTERN.test(product.name || "")
    || BLACK_ISLAND_PATTERN.test(product.image_url || "")
}

export function withoutBlackIslandProducts<T extends ProductIdentity>(products: T[]) {
  return products.filter((product) => !isBlackIslandProduct(product))
}

export function withDemoProducts<T extends StoreProduct>(products: T[]): StoreProduct[] {
  const visibleProducts = withoutBlackIslandProducts(products)
  const demoIds = new Set(DEMO_PRODUCTS.map((product) => product.id))
  return [
    ...DEMO_PRODUCTS,
    ...visibleProducts.filter((product) => !demoIds.has(product.id)),
  ]
}

export function getDemoProduct(id: string) {
  if (id === CUSTOM_TEE_PRODUCT.id) return CUSTOM_TEE_PRODUCT
  return DEMO_PRODUCTS.find((product) => product.id === id) || null
}
