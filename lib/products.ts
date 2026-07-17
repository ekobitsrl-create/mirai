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
      "Bermuda in tessuto camouflage con cristalli e pietre multicolor applicati sul fronte. La linea ampia e rilassata unisce ispirazione military, dettagli luminosi e comfort streetwear.",
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
      "Camicia oversize in tessuto camouflage con cristalli e pietre multicolor. Il fit boxy e la decorazione degradé sulle spalle fondono attitudine military e finiture luxury.",
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
      "T-shirt in cotone nero con trattamento distressed e micro rotture diffuse. La stampa frontale aggiunge carattere a una silhouette contemporanea e vissuta.",
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
    id: "minimal-m0273-tshirt-croce-panna",
    name: "T-shirt Graphic Cross Panna",
    description:
      "T-shirt oversize off white in cotone, con maxi croce a effetto pennellata, figura centrale e lettering destrutturato. Spalle scese, maniche ampie e fondo destroyed completano il design unisex.",
    price: 44,
    category: "t-shirt",
    image_url: "/products/minimal-couture/m0273-tshirt-croce-panna.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:01:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0273",
    color_name: "Panna / Nero",
    color_hex: "#eee7d6",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Cotone color panna con trattamento distressed",
      "Micro rotture diffuse",
      "Grande stampa croce sul fronte",
      "Girocollo e manica corta oversize",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0259-tshirt-croci-color-panna",
    name: "T-shirt Croci Color Panna",
    description:
      "T-shirt in cotone chiaro con trattamento distressed e micro rotture diffuse. La stampa frontale dona personalità al capo mantenendo un’estetica pulita e contemporanea.",
    price: 44,
    category: "t-shirt",
    image_url: "/products/minimal-couture/m0259-tshirt-croci-panna-front.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:01:30.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0259",
    color_name: "Panna / Multicolor",
    color_hex: "#eee7d6",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Cotone color panna con trattamento distressed",
      "Micro rotture diffuse",
      "Stampa frontale con croci colorate",
      "Lettering Querida Santa Madre sul retro",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
    image_gallery: [
      {
        src: "/products/minimal-couture/m0259-tshirt-croci-panna-front.jpeg",
        alt: "T-shirt Croci Color Panna vista frontale",
      },
      {
        src: "/products/minimal-couture/m0259-tshirt-croci-panna-back.jpeg",
        alt: "T-shirt Croci Color Panna vista posteriore",
      },
    ],
  },
  {
    id: "minimal-m0095-tshirt-madonna-viola",
    name: "T-shirt Madonna Distressed Viola",
    description:
      "T-shirt viola in cotone con trattamento distressed e micro rotture diffuse. La stampa frontale e la costruzione oversize definiscono un’estetica decisa e contemporanea.",
    price: 44,
    category: "t-shirt",
    image_url: "/products/minimal-couture/m0095-tshirt-madonna-viola-front.jpeg",
    sizes: ["M", "L", "XL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:01:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0095",
    color_name: "Viola",
    color_hex: "#7135a2",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Cotone viola con trattamento distressed",
      "Grafica Madonna sul fronte",
      "Lettering Querida Santa Madre sul retro",
      "Girocollo e manica corta oversize",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { M: 2, L: 2, XL: 1 },
    image_gallery: [
      {
        src: "/products/minimal-couture/m0095-tshirt-madonna-viola-front.jpeg",
        alt: "T-shirt Madonna Distressed Viola vista frontale",
      },
      {
        src: "/products/minimal-couture/m0095-tshirt-madonna-viola-back.jpeg",
        alt: "T-shirt Madonna Distressed Viola vista posteriore",
      },
    ],
  },
  {
    id: "minimal-m0268-canotta-eagle-bordeaux",
    name: "Canotta Minimal Eagle Bordeaux",
    description:
      "Canotta oversize bordeaux con stampa Minimal Eagle sul fronte, lavaggio vissuto e giromanica ampio dal taglio streetwear.",
    price: 39,
    category: "canotte",
    image_url: "/products/minimal-couture/m0268-canotta-eagle-bordeaux.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T18:00:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0268",
    color_name: "Bordeaux",
    color_hex: "#6b333d",
    fit_note: "Vestibilità ampia: scegli la tua taglia abituale.",
    detail_items: [
      "Lavaggio bordeaux effetto vintage",
      "Stampa aquila e fiamme sul fronte",
      "Giromanica ampio con finitura raw cut",
      "Fondo dritto",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0267-canotta-crown-verde",
    name: "Canotta Minimal Crown Verde",
    description:
      "Canotta oversize verde con stampa Crown sul fronte, lavaggio vissuto e finiture distressed per un’attitudine street immediata.",
    price: 39,
    category: "canotte",
    image_url: "/products/minimal-couture/m0267-canotta-crown-verde.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:59:30.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0267",
    color_name: "Verde washed",
    color_hex: "#737a57",
    fit_note: "Vestibilità ampia: scegli la tua taglia abituale.",
    detail_items: [
      "Lavaggio verde effetto vintage",
      "Grafica Crown con occhio e dadi",
      "Giromanica ampio con finitura raw cut",
      "Dettagli distressed",
    ],
    care: "Lavare al rovescio a 30°C con ciclo delicato. Non stirare direttamente sulla stampa.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0254-bermuda-applicazioni-blu",
    name: "Bermuda Denim Applicazioni Blu",
    description:
      "Bermuda denim blu con lavaggio sfumato e applicazioni luminose lungo i lati. Variante blu del codice M.0254, con taglio cinque tasche e linea regolare.",
    price: 39,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0254-bermuda-applicazioni-blu.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:59:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0254",
    color_name: "Blu washed",
    color_hex: "#4f5960",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim blu effetto washed",
      "Applicazioni luminose laterali",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere le applicazioni.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0255-bermuda-strass-nero",
    name: "Bermuda Denim Crystal Nero",
    description:
      "Bermuda denim nero con una fitta applicazione di crystal che si concentra sui lati e sfuma verso il centro. Taglio cinque tasche e lavaggio scuro.",
    price: 47,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0255-bermuda-strass-nero.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:58:30.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0255",
    color_name: "Nero washed",
    color_hex: "#222226",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim nero effetto washed",
      "Crystal sfumati dal lato verso il centro",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere i crystal.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0255-bermuda-strass-marrone",
    name: "Bermuda Denim Crystal Marrone",
    description:
      "Bermuda denim marrone lavato con crystal sfumati lungo entrambi i lati. Una variante calda e neutra del modello M.0255.",
    price: 47,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0255-bermuda-strass-marrone.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:58:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0255",
    color_name: "Marrone washed",
    color_hex: "#807268",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim marrone effetto washed",
      "Crystal sfumati dal lato verso il centro",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere i crystal.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0255-bermuda-strass-blu",
    name: "Bermuda Denim Crystal Blu",
    description:
      "Bermuda denim blu con lavaggio vintage e una cascata di crystal sui lati. Il modello conserva una linea pulita sul retro e una finitura luminosa sul fronte.",
    price: 47,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0255-bermuda-strass-blu.jpeg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:57:30.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0255",
    color_name: "Blu vintage",
    color_hex: "#596061",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim blu con lavaggio vintage",
      "Crystal sfumati sui lati",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere i crystal.",
    stock_by_size: { S: 2, M: 2, L: 2, XL: 1, XXL: 1 },
  },
  {
    id: "minimal-m0089-camicia-denim-strass-perle",
    name: "Camicia Denim Strass e Perle",
    description:
      "Camicia oversize a manica corta in denim blu, ricoperta da strass e perle sul fronte, sul retro e sul colletto. Pensata in coordinato con il Bermuda Denim Strass e Perle.",
    price: 47,
    category: "camicie",
    image_url: "/products/minimal-couture/m0089-camicia-denim-perle-front.jpeg",
    sizes: ["S", "M", "L", "XL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:57:00.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0089",
    color_name: "Denim blu",
    color_hex: "#405966",
    fit_note: "Vestibilità oversize: scegli la tua taglia abituale.",
    detail_items: [
      "Denim blu effetto washed",
      "Applicazioni di strass e perle",
      "Manica corta e colletto classico",
      "Chiusura frontale con bottoni",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere strass e perle.",
    stock_by_size: { S: 2, M: 3, L: 3, XL: 2 },
    image_gallery: [
      {
        src: "/products/minimal-couture/m0089-camicia-denim-perle-front.jpeg",
        alt: "Camicia Denim Strass e Perle vista frontale",
        fit: "cover",
        position: "50% 52%",
      },
      {
        src: "/products/minimal-couture/m0089-camicia-denim-perle-back.jpeg",
        alt: "Camicia Denim Strass e Perle vista posteriore",
        fit: "cover",
        position: "50% 52%",
      },
      {
        src: "/products/minimal-couture/m0089-camicia-denim-perle-fit.jpeg",
        alt: "Camicia Denim Strass e Perle indossata",
        fit: "cover",
        position: "50% 54%",
      },
    ],
  },
  {
    id: "minimal-m0090-bermuda-denim-strass-perle",
    name: "Bermuda Denim Strass e Perle",
    description:
      "Bermuda cinque tasche in denim blu con strass e perle distribuiti sul fronte. Completa il coordinato con la Camicia Denim Strass e Perle M.0089.",
    price: 47,
    category: "pantaloni",
    image_url: "/products/minimal-couture/m0090-bermuda-denim-perle-front.jpeg",
    sizes: ["S", "M", "L", "XL"],
    in_stock: true,
    is_new: true,
    created_at: "2026-07-16T17:56:30.000Z",
    brand: "Minimal Couture",
    supplier_sku: "M.0090",
    color_name: "Denim blu",
    color_hex: "#526a75",
    fit_note: "Vestibilità regolare: scegli la tua taglia abituale.",
    detail_items: [
      "Denim blu effetto washed",
      "Applicazioni di strass e perle",
      "Costruzione cinque tasche",
      "Chiusura frontale con bottone e zip",
    ],
    care: "Lavare al rovescio con ciclo delicato e seguire l'etichetta interna per proteggere strass e perle.",
    stock_by_size: { S: 2, M: 3, L: 3, XL: 2 },
    image_gallery: [
      {
        src: "/products/minimal-couture/m0090-bermuda-denim-perle-front.jpeg",
        alt: "Bermuda Denim Strass e Perle vista frontale",
        fit: "cover",
        position: "50% 54%",
      },
      {
        src: "/products/minimal-couture/m0090-bermuda-denim-perle-back.jpeg",
        alt: "Bermuda Denim Strass e Perle vista posteriore",
        fit: "cover",
        position: "50% 54%",
      },
      {
        src: "/products/minimal-couture/m0090-bermuda-denim-perle-fit.jpeg",
        alt: "Bermuda Denim Strass e Perle indossato",
        fit: "cover",
        position: "50% 54%",
      },
    ],
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
