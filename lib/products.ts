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
  brand?: string
  supplier_sku?: string
  color_name?: string
  color_hex?: string
  fit_note?: string
  detail_items?: string[]
  composition?: string
  care?: string
  stock_by_size?: Record<string, number>
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
  brand: "MIRAI",
  color_name: "Bianco / Multicolor",
  color_hex: "#f3f1ea",
  fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
  detail_items: [
    "Cotone heavyweight premium",
    "Fit oversize con spalla scesa",
    "Stampa frontale Valley Athletic",
    "Collo a costine rinforzato",
  ],
  composition: "100% cotone.",
  care: "Lavare al rovescio a 30°C con colori simili. Non candeggiare e non stirare direttamente sulla stampa.",
}

export const ORDERED_PRODUCTS: StoreProduct[] = [
  {
    id: "minimal-m0230-bermuda-camouflage-crystal",
    name: "Bermuda Camouflage Crystal",
    description:
      "Bermuda cinque tasche in fantasia camouflage, rifinito con micro crystal e applicazioni multicolor distribuite sul fronte. Un capo street deciso, pensato anche in coordinato con la Camicia Oversize Camouflage Crystal.",
    price: 47,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0230-bermuda-camouflage-crystal.jpg",
    sizes: ["M", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:05:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0230",
    color_name: "Camouflage multicolor",
    color_hex: "#625a3f",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Fantasia camouflage woodland",
      "Micro crystal e applicazioni multicolor",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere le applicazioni.",
    stock_by_size: { M: 2, XL: 2, XXL: 1 },
  },
  {
    id: "minimal-m0236-camicia-oversize-camouflage-crystal",
    name: "Camicia Oversize Camouflage Crystal",
    description:
      "Camicia a manica corta in fantasia camouflage con crystal e applicazioni multicolor sul fronte. Linea ampia e costruzione pulita, coordinabile con il Bermuda Camouflage Crystal.",
    price: 47,
    category: "camicie",
    image_url: "/products/minimal-couture/m0236-camicia-camouflage-crystal.jpg",
    sizes: ["M", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:04:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0236",
    color_name: "Camouflage multicolor",
    color_hex: "#625a3f",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Fantasia camouflage woodland",
      "Crystal e applicazioni multicolor",
      "Manica corta e colletto classico",
      "Chiusura frontale con bottoni",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere le applicazioni.",
    stock_by_size: { M: 2, XL: 2, XXL: 1 },
  },
  {
    id: "minimal-m0254-bermuda-strass-laterali-black",
    name: "Bermuda Denim Strass Laterali Black",
    description:
      "Bermuda in denim nero dal lavaggio vissuto, impreziosito da applicazioni di strass lungo entrambi i lati. Taglio cinque tasche e carattere street con una finitura luminosa.",
    price: 39,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0254-bermuda-strass-laterali-black.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:03:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0254",
    color_name: "Black washed",
    color_hex: "#252429",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim nero effetto washed",
      "Applicazioni di strass laterali",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere gli strass.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0259-tshirt-croci-color-black",
    name: "T-shirt Croci Color Black",
    description:
      "T-shirt nera in cotone con trattamento distressed e micro rotture diffuse. La stampa frontale di croci colorate crea un contrasto deciso su una silhouette ampia e contemporanea.",
    price: 44,
    category: "t-shirt",
    image_url: "/products/minimal-couture/m0259-tshirt-croci-color-black.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:02:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0259",
    color_name: "Nero / Multicolor",
    color_hex: "#17161a",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Cotone con trattamento distressed",
      "Micro rotture diffuse",
      "Stampa frontale con croci colorate",
      "Girocollo e manica corta",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0095-tshirt-distressed-madonna-panna",
    name: "T-shirt Oversize Graphic Cross Off White",
    description:
      "T-shirt color panna con micro rotture e grande stampa frontale Madonna su croce, completata da lettering sovrapposto. Fit ampio e grafica ad alto impatto.",
    price: 44,
    category: "t-shirt",
    image_url: "/products/minimal-couture/m0095-tshirt-madonna-panna.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:01:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0095",
    color_name: "Panna / Nero",
    color_hex: "#eee7d6",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Tessuto color panna con trattamento distressed",
      "Micro rotture diffuse",
      "Stampa frontale Madonna e croce",
      "Girocollo e manica corta",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
]

export const DEMO_PRODUCTS: StoreProduct[] = [...ORDERED_PRODUCTS, VALLEY_ATHLETIC_TEE]

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
