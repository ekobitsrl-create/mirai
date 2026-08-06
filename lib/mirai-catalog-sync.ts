import "server-only"

type Db = { from: (table: string) => any }
type Img = { src: string; alt: string; fit: "contain"; position: "center" }
type Seed = {
  sku: string
  name: string
  description: string
  price: number
  category: "shorts" | "felpe"
  image: string
  sizes: string[]
  color: string
  hex: string
  fit: string
  details: string[]
  composition: string
  care: string
}

const SHORT_SIZES = ["44", "46", "48", "50", "52", "54", "56"]
const HOODIE_SIZES = ["S", "M", "L", "XL", "XXL"]
const denimComposition = "Tessuto denim. Per la composizione completa consultare l'etichetta interna del capo."
const hoodieComposition = "Tessuto felpato. Per la composizione completa consultare l'etichetta interna del capo."
const denimCare = "Per preservare lavaggio, ricami e applicazioni, lavare al rovescio con ciclo delicato, senza strofinare i dettagli. Seguire sempre le indicazioni riportate sull'etichetta interna."
const hoodieCare = "Lavare al rovescio con ciclo delicato per proteggere ricami e crystal. Non strofinare le applicazioni e seguire sempre le indicazioni riportate sull'etichetta interna."
const shortFit = "Vestibilità baggy, ampia sulla gamba e con lunghezza sotto il ginocchio. Scegli la tua taglia abituale per mantenere il volume previsto dal modello."
const hoodieFit = "Vestibilità oversize con spalla rilassata e volumi ampi. Scegli la tua taglia abituale per mantenere il fit previsto dal modello."

const seeds: Seed[] = [
  {
    sku: "MIRAI-VALLEY-SCRIPT-SAGE-035",
    name: "Valley Script Distressed Jorts - Sage Wash",
    description: "Bermuda baggy in denim verde salvia con lavaggio minerale, abrasioni diffuse e maxi lettering Valley applicato sul fronte. Il trattamento irregolare crea profondità e un autentico effetto vissuto, mentre la gamba ampia e i lacci extra long definiscono una silhouette streetwear decisa e rilassata.",
    price: 180,
    category: "shorts",
    image: "/products/mirai-supplier/valley-script-distressed-jorts-sage-01.svg",
    sizes: SHORT_SIZES,
    color: "Verde salvia washed",
    hex: "#85897d",
    fit: shortFit,
    details: ["Denim verde salvia con lavaggio minerale", "Maxi lettering Valley applicato sul fronte", "Abrasioni ed effetto distressed all-over", "Vita regolabile con lacci extra long", "Taglio baggy sotto il ginocchio"],
    composition: denimComposition,
    care: denimCare,
  },
  {
    sku: "MIRAI-VALLEY-SCRIPT-WHITE-036",
    name: "Valley Script Distressed Jorts - White Wash",
    description: "Bermuda baggy in denim bianco con lavaggio sporco, segni distressed a contrasto e maxi lettering Valley applicato sul fronte. La base chiara amplifica la lavorazione vissuta del tessuto e mette in risalto il volume oversize, per un capo streetwear pulito nella palette ma ricco di carattere.",
    price: 180,
    category: "shorts",
    image: "/products/mirai-supplier/valley-script-distressed-jorts-white-01.svg",
    sizes: SHORT_SIZES,
    color: "Bianco washed",
    hex: "#e8e5de",
    fit: shortFit,
    details: ["Denim bianco con lavaggio sporco", "Maxi lettering Valley applicato sul fronte", "Segni distressed e abrasioni a contrasto", "Vita regolabile con lacci extra long", "Taglio baggy sotto il ginocchio"],
    composition: denimComposition,
    care: denimCare,
  },
  {
    sku: "MIRAI-VALE-ICE-BLACK-037",
    name: "Vale Forever Ice Cream Jorts - Black Wash",
    description: "Bermuda baggy in denim nero washed con maxi ricamo multicolore Valley Dreams Lives Forever e una costellazione di crystal applicati sul fronte. Il contrasto tra la base scura, il lettering acceso e i dettagli luminosi costruisce un capo scenografico, mentre la gamba ampia e i lacci extra long mantengono una silhouette autenticamente streetwear.",
    price: 180,
    category: "shorts",
    image: "/products/mirai-supplier/vale-forever-ice-cream-jorts-black-01.svg",
    sizes: SHORT_SIZES,
    color: "Nero washed",
    hex: "#222222",
    fit: shortFit,
    details: ["Denim nero con lavaggio washed", "Maxi ricamo Valley Dreams Lives Forever", "Applicazioni crystal multicolore sul fronte", "Vita regolabile con lacci extra long", "Taglio baggy sotto il ginocchio"],
    composition: denimComposition,
    care: denimCare,
  },
  ...[
    ["BLACK", "Black", "Nero", "#111111", "nero"],
    ["BLUE", "Blue", "Blu elettrico", "#2468d8", "blu elettrico"],
    ["RED", "Red", "Rosso", "#e64545", "rosso"],
    ["WHITE", "White", "Bianco", "#f3f3f1", "bianco"],
  ].map(([code, fileColor, color, hex, adjective], index): Seed => ({
    sku: `MIRAI-VALLEY-DREAMS-HOOD-${code}-0${38 + index}`,
    name: `Valley Dreams Crystal Zip Hoodie - ${fileColor}`,
    description: `Felpa zip ${adjective} dal fit oversize con maxi lettering Valley Dreams applicato sul fronte e una distribuzione di crystal che attraversa cappuccio, spalle e maniche. La costruzione rilassata incontra dettagli luminosi e proporzioni streetwear, creando un capo riconoscibile ma facile da inserire nel layering quotidiano.`,
    price: 190,
    category: "felpe",
    image: `/products/mirai-supplier/valley-dreams-crystal-zip-hoodie-${fileColor.toLowerCase()}-01.svg`,
    sizes: HOODIE_SIZES,
    color,
    hex,
    fit: hoodieFit,
    details: ["Felpa con cappuccio e chiusura zip", "Maxi lettering Valley Dreams sul fronte", "Applicazioni crystal su cappuccio e maniche", "Tasche frontali e fondo elasticizzato", "Vestibilità oversize streetwear"],
    composition: hoodieComposition,
    care: hoodieCare,
  })),
  ...[
    ["BLACK", "Black", "Nero", "#111111", "nera"],
    ["YELLOW", "Yellow", "Giallo", "#daba4b", "gialla"],
    ["PURPLE", "Purple", "Lilla", "#8d81d8", "lilla"],
  ].map(([code, fileColor, color, hex, adjective], index): Seed => ({
    sku: `MIRAI-VALLEY-CREST-HOOD-${code}-0${42 + index}`,
    name: `Valley Crest Crystal Zip Hoodie - ${fileColor}`,
    description: `Felpa zip ${adjective} dal taglio oversize con crest ricamato sul petto e una pioggia di crystal distribuiti su fronte, spalle e maniche. Il contrasto tra la costruzione essenziale e i dettagli luminosi dona al capo una presenza forte, pensata per outfit streetwear premium e layering rilassato.`,
    price: 190,
    category: "felpe",
    image: `/products/mirai-supplier/valley-crest-crystal-zip-hoodie-${fileColor.toLowerCase()}-01.svg`,
    sizes: HOODIE_SIZES,
    color,
    hex,
    fit: hoodieFit,
    details: ["Felpa con cappuccio e chiusura zip", "Crest ricamato applicato sul petto", "Applicazioni crystal diffuse su fronte e maniche", "Tasche frontali e fondo elasticizzato", "Vestibilità oversize streetwear"],
    composition: hoodieComposition,
    care: hoodieCare,
  })),
]

function stock(sizes: string[]) {
  return Object.fromEntries(sizes.map((size) => [size, 50]))
}

function image(src: string, alt: string): Img {
  return { src, alt, fit: "contain", position: "center" }
}

function row(seed: Seed) {
  return {
    name: seed.name,
    description: seed.description,
    price: seed.price,
    category: seed.category,
    image_url: seed.image,
    image_gallery: [image(seed.image, seed.name)],
    sizes: seed.sizes,
    stock_by_size: stock(seed.sizes),
    in_stock: true,
    is_new: true,
    brand: "MIRAI",
    supplier_profile: "mirai",
    supplier_sku: seed.sku,
    gtin: null,
    shipping_min_days: 7,
    shipping_max_days: 12,
    color_name: seed.color,
    color_hex: seed.hex,
    fit_note: seed.fit,
    detail_items: seed.details,
    composition: seed.composition,
    care: seed.care,
  }
}

function mergeGallery(current: unknown, imageUrl: string | null, additions: Img[], alt: string) {
  const values = [
    ...(imageUrl ? [image(imageUrl, alt)] : []),
    ...(Array.isArray(current) ? current.map((item) => typeof item === "string" ? image(item, alt) : item) : []),
    ...additions,
  ]
  return values.filter((item, index) => item?.src && values.findIndex((candidate) => candidate?.src === item.src) === index)
}

async function ensureFelpe(db: Db) {
  const { data, error } = await db.from("categories").select("id").eq("slug", "felpe").maybeSingle()
  if (error) throw error
  const values = {
    name: "Felpe",
    slug: "felpe",
    description: "Felpe oversize, hoodie e zip hoodie streetwear MIRAI.",
    image_url: "/products/mirai-supplier/valley-dreams-crystal-zip-hoodie-black-01.svg",
    sort_order: 30,
  }
  if (!data) {
    const { error: insertError } = await db.from("categories").insert(values)
    if (insertError) throw insertError
  }
}

async function syncProducts(db: Db) {
  const skus = seeds.map((seed) => seed.sku)
  const { data, error } = await db.from("products").select("id, supplier_sku").in("supplier_sku", skus)
  if (error) throw error
  const existing = new Map((data || []).map((item: any) => [item.supplier_sku, item.id]))
  for (const seed of seeds) {
    const values = row(seed)
    const id = existing.get(seed.sku)
    const result = id
      ? await db.from("products").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id)
      : await db.from("products").insert(values)
    if (result.error) throw result.error
  }
}

async function syncNightSpark(db: Db) {
  const { data, error } = await db.from("products").select("id").eq("supplier_sku", "MIRAI-NIGHT-SPARK-027").maybeSingle()
  if (error) throw error
  if (!data) return
  const sources = [
    "/products/mirai-supplier/night-spark-crystal-shorts-black-01.webp",
    ...[2, 3, 4, 5, 6].map((number) => `/products/mirai-supplier/night-spark-crystal-shorts-black-0${number}.svg`),
  ]
  const result = await db.from("products").update({
    sizes: SHORT_SIZES,
    stock_by_size: stock(SHORT_SIZES),
    in_stock: true,
    image_gallery: sources.map((src, index) => image(src, index ? `Night Spark Crystal Shorts - dettaglio ${index}` : "Night Spark Crystal Shorts - vista completa")),
    updated_at: new Date().toISOString(),
  }).eq("id", data.id)
  if (result.error) throw result.error
}

async function syncLightRinse(db: Db) {
  const { data, error } = await db.from("products").select("id, name, supplier_sku, color_name, image_url, image_gallery, sizes").ilike("name", "%Ice Cream Jorts%")
  if (error) throw error
  const product = (data || []).find((item: any) => {
    if (item.supplier_sku === "MIRAI-VALE-ICE-BLACK-037") return false
    const identity = `${item.name || ""} ${item.color_name || ""}`.toLowerCase()
    return !identity.includes("black") && !identity.includes("nero")
  })
  if (!product) return
  const added = image("/products/mirai-supplier/vale-forever-ice-cream-jorts-light-rinse-02.svg", "Vale Forever Ice Cream Jorts Light Rinse - fronte e retro")
  const values: Record<string, unknown> = {
    image_gallery: mergeGallery(product.image_gallery, product.image_url, [added], product.name),
    updated_at: new Date().toISOString(),
  }
  if (Array.isArray(product.sizes) && product.sizes.length) {
    values.stock_by_size = stock(product.sizes)
    values.in_stock = true
  }
  const result = await db.from("products").update(values).eq("id", product.id)
  if (result.error) throw result.error
}

export async function syncMiraiUploadedCatalog(db: Db) {
  await ensureFelpe(db)
  await syncProducts(db)
  await syncNightSpark(db)
  await syncLightRinse(db)
}
