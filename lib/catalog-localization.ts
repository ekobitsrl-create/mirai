import type { StoreProduct } from "@/lib/products"
import type { Locale } from "@/lib/translations"

type ForeignLocale = Exclude<Locale, "it">

const exactNames: Record<string, Record<ForeignLocale, string>> = {
  "Camicia Denim Strass e Perle": { en: "Denim Shirt with Rhinestones and Pearls", es: "Camisa vaquera con strass y perlas", de: "Jeanshemd mit Strass und Perlen", fr: "Chemise en denim avec strass et perles" },
  "Camicia Oversize Camouflage Crystal": { en: "Oversized Camouflage Crystal Shirt", es: "Camisa oversize camouflage con cristales", de: "Oversized-Camouflage-Hemd mit Kristallen", fr: "Chemise oversize camouflage à cristaux" },
  "Canotta Crown Verde": { en: "Green Crown Tank Top", es: "Camiseta sin mangas Crown verde", de: "Grünes Crown-Tanktop", fr: "Débardeur Crown vert" },
  "Canotta Eagle Bordeaux": { en: "Burgundy Eagle Tank Top", es: "Camiseta sin mangas Eagle burdeos", de: "Bordeauxrotes Eagle-Tanktop", fr: "Débardeur Eagle bordeaux" },
  "Bermuda Camouflage Crystal": { en: "Camouflage Crystal Denim Shorts", es: "Bermudas vaqueras camouflage con cristales", de: "Camouflage-Jeansshorts mit Kristallen", fr: "Bermuda en denim camouflage à cristaux" },
  "Bermuda Denim Applicazioni Blu": { en: "Blue Embellished Denim Shorts", es: "Bermudas vaqueras azules con aplicaciones", de: "Blaue Jeansshorts mit Applikationen", fr: "Bermuda en denim bleu à applications" },
  "Bermuda Denim Crystal Blu": { en: "Blue Crystal Denim Shorts", es: "Bermudas vaqueras azules con cristales", de: "Blaue Crystal-Jeansshorts", fr: "Bermuda en denim bleu à cristaux" },
  "Bermuda Denim Crystal Marrone": { en: "Brown Crystal Denim Shorts", es: "Bermudas vaqueras marrones con cristales", de: "Braune Crystal-Jeansshorts", fr: "Bermuda en denim marron à cristaux" },
  "Bermuda Denim Crystal Nero": { en: "Black Crystal Denim Shorts", es: "Bermudas vaqueras negras con cristales", de: "Schwarze Crystal-Jeansshorts", fr: "Bermuda en denim noir à cristaux" },
  "Bermuda Denim Strass e Perle": { en: "Denim Shorts with Rhinestones and Pearls", es: "Bermudas vaqueras con strass y perlas", de: "Jeansshorts mit Strass und Perlen", fr: "Bermuda en denim avec strass et perles" },
  "Bermuda Denim Strass Laterali Black": { en: "Black Denim Shorts with Side Rhinestones", es: "Bermudas vaqueras negras con strass laterales", de: "Schwarze Jeansshorts mit seitlichem Strass", fr: "Bermuda en denim noir avec strass latéraux" },
  "T-shirt Croci Color Black": { en: "Black Cross Graphic T-shirt", es: "Camiseta negra con gráfico de cruces", de: "Schwarzes T-Shirt mit Kreuzgrafik", fr: "T-shirt noir à motif croix" },
  "T-shirt Croci Color Panna": { en: "Cream Cross Graphic T-shirt", es: "Camiseta crema con gráfico de cruces", de: "Cremefarbenes T-Shirt mit Kreuzgrafik", fr: "T-shirt écru à motif croix" },
  "T-shirt Graphic Cross Panna": { en: "Cream Graphic Cross T-shirt", es: "Camiseta crema Graphic Cross", de: "Cremefarbenes Graphic-Cross-T-Shirt", fr: "T-shirt écru Graphic Cross" },
  "T-shirt Madonna Distressed Viola": { en: "Purple Distressed Madonna T-shirt", es: "Camiseta Madonna distressed morada", de: "Violettes Distressed-Madonna-T-Shirt", fr: "T-shirt Madonna distressed violet" },
}

const colorRows: Record<string, Record<ForeignLocale, string>> = {
  nero: { en: "Black", es: "Negro", de: "Schwarz", fr: "Noir" },
  black: { en: "Black", es: "Negro", de: "Schwarz", fr: "Noir" },
  bianco: { en: "White", es: "Blanco", de: "Weiß", fr: "Blanc" },
  white: { en: "White", es: "Blanco", de: "Weiß", fr: "Blanc" },
  panna: { en: "Cream", es: "Crema", de: "Creme", fr: "Écru" },
  rosa: { en: "Pink", es: "Rosa", de: "Rosa", fr: "Rose" },
  pink: { en: "Pink", es: "Rosa", de: "Rosa", fr: "Rose" },
  blu: { en: "Blue", es: "Azul", de: "Blau", fr: "Bleu" },
  blue: { en: "Blue", es: "Azul", de: "Blau", fr: "Bleu" },
  marrone: { en: "Brown", es: "Marrón", de: "Braun", fr: "Marron" },
  brown: { en: "Brown", es: "Marrón", de: "Braun", fr: "Marron" },
  verde: { en: "Green", es: "Verde", de: "Grün", fr: "Vert" },
  green: { en: "Green", es: "Verde", de: "Grün", fr: "Vert" },
  giallo: { en: "Yellow", es: "Amarillo", de: "Gelb", fr: "Jaune" },
  yellow: { en: "Yellow", es: "Amarillo", de: "Gelb", fr: "Jaune" },
  rosso: { en: "Red", es: "Rojo", de: "Rot", fr: "Rouge" },
  red: { en: "Red", es: "Rojo", de: "Rot", fr: "Rouge" },
  viola: { en: "Purple", es: "Morado", de: "Violett", fr: "Violet" },
  purple: { en: "Purple", es: "Morado", de: "Violett", fr: "Violet" },
  sabbia: { en: "Sand", es: "Arena", de: "Sand", fr: "Sable" },
  sand: { en: "Sand", es: "Arena", de: "Sand", fr: "Sable" },
  bordeaux: { en: "Burgundy", es: "Burdeos", de: "Bordeaux", fr: "Bordeaux" },
  "nero slavato": { en: "Washed Black", es: "Negro lavado", de: "Washed Black", fr: "Noir délavé" },
  "black washed": { en: "Washed Black", es: "Negro lavado", de: "Washed Black", fr: "Noir délavé" },
  "nero washed": { en: "Washed Black", es: "Negro lavado", de: "Washed Black", fr: "Noir délavé" },
  "blu washed": { en: "Washed Blue", es: "Azul lavado", de: "Washed Blue", fr: "Bleu délavé" },
  "marrone washed": { en: "Washed Brown", es: "Marrón lavado", de: "Washed Brown", fr: "Marron délavé" },
  "verde washed": { en: "Washed Green", es: "Verde lavado", de: "Washed Green", fr: "Vert délavé" },
  "rosso slavato": { en: "Washed Red", es: "Rojo lavado", de: "Washed Red", fr: "Rouge délavé" },
  "vintage black": { en: "Vintage Black", es: "Negro vintage", de: "Vintage-Schwarz", fr: "Noir vintage" },
  "black wash": { en: "Black Wash", es: "Negro lavado", de: "Black Wash", fr: "Noir délavé" },
  "light blue": { en: "Light Blue", es: "Azul claro", de: "Hellblau", fr: "Bleu clair" },
  lilla: { en: "Lilac", es: "Lila", de: "Flieder", fr: "Lilas" },
  "camouflage multicolor": { en: "Multicolour Camouflage", es: "Camouflage multicolor", de: "Mehrfarbiges Camouflage", fr: "Camouflage multicolore" },
  "blu denim light rinse": { en: "Light Rinse Denim Blue", es: "Azul denim lavado claro", de: "Denimblau Light Rinse", fr: "Bleu denim délavage clair" },
  "bianco sporco": { en: "Off-white", es: "Blanco roto", de: "Off-White", fr: "Blanc cassé" },
  "dirt / cream": { en: "Dirt / Cream", es: "Tierra / Crema", de: "Dirt / Creme", fr: "Terre / Écru" },
  "dirt / green": { en: "Dirt / Green", es: "Tierra / Verde", de: "Dirt / Grün", fr: "Terre / Vert" },
}

export function localizeColor(value: string | null | undefined, locale: Locale) {
  if (!value || locale === "it") return value || ""
  const normalized = value.trim().toLocaleLowerCase("it-IT")
  const exact = colorRows[normalized]
  if (exact) return exact[locale]
  return value.split(/\s*\/\s*/).map((part) => colorRows[part.toLowerCase()]?.[locale] || part).join(" / ")
}

function translateCommercialTerms(value: string, locale: ForeignLocale) {
  const rules: Record<ForeignLocale, Array<[RegExp, string]>> = {
    en: [[/\bCappello\b/gi, "Cap"], [/\bCappelli\b/gi, "Caps"], [/\bCamicia\b/gi, "Shirt"], [/\bCamicie\b/gi, "Shirts"], [/\bCanotta\b/gi, "Tank Top"], [/\bCanotte\b/gi, "Tank Tops"], [/\bFelpa\b/gi, "Hoodie"], [/\bBermuda\b/gi, "Shorts"], [/\bPantaloni\b/gi, "Trousers"], [/\bMaglietta\b/gi, "T-shirt"]],
    es: [[/\bZip Up Hoodie\b/gi, "Sudadera con cremallera"], [/\bZip Hoodie\b/gi, "Sudadera con cremallera"], [/\bSleeveless\b/gi, "Sin mangas"], [/\bTee\b/gi, "Camiseta"], [/\bT-shirt\b/gi, "Camiseta"], [/\bJorts\b/gi, "Bermudas vaqueras"], [/\bShorts\b/gi, "Bermudas"], [/\bJeans\b/gi, "Vaqueros"]],
    de: [[/\bZip Up Hoodie\b/gi, "Zip-Hoodie"], [/\bZip Hoodie\b/gi, "Zip-Hoodie"], [/\bSleeveless\b/gi, "Ärmellos"], [/\bTee\b/gi, "T-Shirt"], [/\bJorts\b/gi, "Jeansshorts"], [/\bShorts\b/gi, "Shorts"]],
    fr: [[/\bZip Up Hoodie\b/gi, "Sweat zippé"], [/\bZip Hoodie\b/gi, "Sweat zippé"], [/\bSleeveless\b/gi, "Sans manches"], [/\bTee\b/gi, "T-shirt"], [/\bJorts\b/gi, "Bermuda en jean"], [/\bShorts\b/gi, "Bermuda"], [/\bJeans\b/gi, "Jean"]],
  }
  return rules[locale].reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
}

export function translateProductName(name: string, locale: Locale) {
  if (!name || locale === "it") return name
  const exact = exactNames[name]?.[locale]
  if (exact) return exact
  const parts = name.split(/(\s+[–-]\s+)/)
  const translated = translateCommercialTerms(parts[0], locale)
  if (parts.length < 3) return translated
  return `${translated}${parts[1]}${localizeColor(parts.slice(2).join(""), locale)}`
}

const categoryDescriptions: Record<string, Record<Locale, string>> = {
  camicie: { it: "Camicie oversize e denim streetwear MIRAI.", en: "MIRAI oversized and denim streetwear shirts.", es: "Camisas oversize y vaqueras streetwear MIRAI.", de: "Oversized- und Denim-Streetwear-Hemden von MIRAI.", fr: "Chemises oversize et denim streetwear MIRAI." },
  headwear: { it: "Cappelli custom New Era personalizzati artigianalmente con cristalli, perle e borchie.", en: "Custom New Era caps hand-finished with crystals, pearls and studs.", es: "Gorras New Era personalizadas y acabadas a mano con cristales, perlas y tachuelas.", de: "Individuelle New-Era-Caps, handveredelt mit Kristallen, Perlen und Nieten.", fr: "Casquettes New Era custom finies à la main avec cristaux, perles et clous." },
  "mirai-parfum-exlusive": { it: "Fragranze MIRAI dalla firma intensa e contemporanea.", en: "MIRAI fragrances with an intense, contemporary signature.", es: "Fragancias MIRAI de carácter intenso y contemporáneo.", de: "MIRAI-Düfte mit intensiver, zeitgemäßer Signatur.", fr: "Parfums MIRAI à la signature intense et contemporaine." },
  profumi: { it: "Fragranze e profumi MIRAI.", en: "MIRAI fragrances and perfumes.", es: "Fragancias y perfumes MIRAI.", de: "Düfte und Parfums von MIRAI.", fr: "Fragrances et parfums MIRAI." },
  "t-shirt": { it: "T-shirt oversize streetwear con grafiche decise, lavaggi vintage e fit rilassato.", en: "Oversized streetwear T-shirts with bold graphics, vintage washes and a relaxed fit.", es: "Camisetas oversize streetwear con gráficos potentes, lavados vintage y corte relajado.", de: "Oversized-Streetwear-T-Shirts mit markanten Grafiken, Vintage-Waschungen und lockerem Fit.", fr: "T-shirts oversize streetwear aux graphismes affirmés, délavages vintage et coupe décontractée." },
  tracksuits: { it: "Completi e tracksuit streetwear coordinati, pensati per comfort e stile urban.", en: "Coordinated streetwear tracksuits designed for comfort and urban style.", es: "Conjuntos streetwear coordinados, creados para ofrecer comodidad y estilo urbano.", de: "Abgestimmte Streetwear-Trainingsanzüge für Komfort und Urban Style.", fr: "Ensembles streetwear coordonnés, pensés pour le confort et le style urbain." },
  jeans: { it: "Jeans streetwear uomo con lavaggi washed, dettagli distressed e vestibilità rilassate.", en: "Men's streetwear jeans with washed finishes, distressed details and relaxed fits.", es: "Vaqueros streetwear para hombre con lavados, detalles distressed y cortes relajados.", de: "Herren-Streetwear-Jeans mit Waschungen, Distressed-Details und lockerem Fit.", fr: "Jeans streetwear homme avec délavages, détails distressed et coupes décontractées." },
  shorts: { it: "Bermuda e shorts streetwear con volumi baggy, denim lavorato e dettagli premium.", en: "Streetwear shorts with baggy proportions, treated denim and premium details.", es: "Bermudas streetwear de volumen baggy, denim trabajado y detalles premium.", de: "Streetwear-Shorts mit Baggy-Volumen, bearbeitetem Denim und Premium-Details.", fr: "Bermudas streetwear aux volumes baggy, denim travaillé et détails premium." },
  canotte: { it: "Canotte e smanicati streetwear MIRAI.", en: "MIRAI streetwear tank tops and sleeveless pieces.", es: "Camisetas y prendas sin mangas streetwear MIRAI.", de: "Streetwear-Tanktops und ärmellose Styles von MIRAI.", fr: "Débardeurs et pièces sans manches streetwear MIRAI." },
  felpe: { it: "Felpe oversize, hoodie e zip hoodie streetwear MIRAI.", en: "MIRAI oversized sweatshirts, hoodies and zip hoodies.", es: "Sudaderas oversize, hoodies y sudaderas con cremallera MIRAI.", de: "Oversized-Sweatshirts, Hoodies und Zip-Hoodies von MIRAI.", fr: "Sweats oversize, hoodies et sweats zippés MIRAI." },
  sweatshirts: { it: "Felpe e sweatshirt streetwear con vestibilità oversize e grafiche urban.", en: "Streetwear sweatshirts with oversized fits and urban graphics.", es: "Sudaderas streetwear de corte oversize y gráficos urbanos.", de: "Streetwear-Sweatshirts mit Oversized-Fit und Urban-Grafiken.", fr: "Sweatshirts streetwear aux coupes oversize et graphismes urbains." },
}

export function translateCategoryDescription(slug: string, fallback: string | null | undefined, locale: Locale) {
  const exact = categoryDescriptions[slug.toLowerCase()]?.[locale]
  if (exact || locale === "it") return exact || fallback || ""

  const generic: Record<ForeignLocale, string> = {
    en: "Explore this MIRAI selection, curated for contemporary streetwear outfits with distinctive fits, materials and details.",
    es: "Descubre esta selección MIRAI, elegida para looks streetwear contemporáneos con cortes, materiales y detalles distintivos.",
    de: "Entdecke diese MIRAI-Auswahl für zeitgemäße Streetwear-Looks mit markanten Passformen, Materialien und Details.",
    fr: "Découvrez cette sélection MIRAI, pensée pour des looks streetwear contemporains aux coupes, matières et détails distinctifs.",
  }
  return generic[locale]
}

type CategoryGuide = {
  label: string
  heading: string
  intro: string
  details: Array<{ title: string; text: string }>
  footer: string
  link: string
}

const categoryGuideKinds: Record<string, "tshirt" | "headwear" | "shirts" | "shorts" | "apparel"> = {
  "t-shirt oversize streetwear": "tshirt",
  "cappelli custom": "headwear",
  "camicie oversize uomo": "shirts",
  "bermuda streetwear uomo": "shorts",
  "abbigliamento urban uomo": "apparel",
}

const categoryGuides: Record<Locale, Record<"tshirt" | "headwear" | "shirts" | "shorts" | "apparel", Omit<CategoryGuide, "label" | "footer" | "link">>> = {
  it: {
    tshirt: { heading: "T-shirt oversize streetwear: fit, peso e identità", intro: "La selezione MIRAI unisce proporzioni oversize, spalle rilassate e grafiche pensate per outfit urban. Ogni modello include indicazioni chiare su taglia, composizione e vestibilità.", details: [{ title: "Fit oversize e boxy", text: "Volumi ampi e linee strutturate cambiano l’equilibrio del look: controlla sempre la nota di vestibilità nella scheda prodotto." }, { title: "Grafiche e materiali", text: "Grafiche decise e tessuti consistenti danno forma al capo e definiscono una silhouette streetwear riconoscibile." }] },
    headwear: { heading: "Cappelli custom: dettagli che rendono unico ogni modello", intro: "I cappelli custom MIRAI trasformano un accessorio streetwear attraverso cristalli, strass, perle, borchie e finiture selezionate.", details: [{ title: "Personalizzazione premium", text: "Ogni composizione valorizza logo, forma e colore del cappello senza perdere la leggibilità del design." }, { title: "Dettagli del prodotto", text: "Nella scheda trovi immagini, colore, taglia e indicazioni di cura del modello selezionato." }] },
    shirts: { heading: "Camicie oversize per un layering streetwear", intro: "Le camicie MIRAI lavorano su volumi rilassati, denim, pattern urban e applicazioni che funzionano aperte sopra una tee o come protagoniste del look.", details: [{ title: "Aperta o abbottonata", text: "Aperta crea profondità nel layering; chiusa mantiene una linea più pulita e strutturata." }, { title: "Texture e dettagli", text: "Camouflage, denim, strass e perle costruiscono un punto focale mantenendo la versatilità streetwear." }] },
    shorts: { heading: "Bermuda streetwear: proporzioni e comfort", intro: "Bermuda e shorts MIRAI combinano gamba ampia, denim lavorato e dettagli premium per bilanciare tee oversize e sneaker.", details: [{ title: "Volume bilanciato", text: "Una parte inferiore ampia dialoga bene con una boxy tee o uno strato superiore più lungo." }, { title: "Finiture distintive", text: "Lavaggi, patch, cristalli e applicazioni caratterizzano ogni modello senza rinunciare alla praticità." }] },
    apparel: { heading: "Abbigliamento urban costruito per esprimersi", intro: "Le collezioni MIRAI riuniscono silhouette oversize, grafiche decise e capi facili da combinare in un guardaroba streetwear coerente.", details: [{ title: "Silhouette coerenti", text: "Le categorie dialogano attraverso proporzioni rilassate, layering e una palette urbana." }, { title: "Scelta consapevole", text: "Schede prodotto, taglie e note sul fit aiutano a scegliere online il capo più adatto." }] },
  },
  en: {
    tshirt: { heading: "Oversized streetwear T-shirts: fit, weight and identity", intro: "The MIRAI selection combines oversized proportions, relaxed shoulders and graphics created for urban outfits. Every style includes clear guidance on sizing, composition and fit.", details: [{ title: "Oversized and boxy fit", text: "Generous volumes and structured lines change the balance of a look: always check the fit note on the product page." }, { title: "Graphics and materials", text: "Bold graphics and substantial fabrics give the garment shape and define a distinctive streetwear silhouette." }] },
    headwear: { heading: "Custom caps: details that make every style distinctive", intro: "MIRAI custom caps transform a streetwear accessory through crystals, rhinestones, pearls, studs and selected finishes.", details: [{ title: "Premium customisation", text: "Each composition enhances the cap’s logo, shape and colour while keeping the original design clear." }, { title: "Product information", text: "The product page shows images, colour, size and care guidance for the selected style." }] },
    shirts: { heading: "Oversized shirts for streetwear layering", intro: "MIRAI shirts explore relaxed volumes, denim, urban patterns and applications that work open over a tee or as the focus of the look.", details: [{ title: "Open or buttoned", text: "Worn open, the shirt adds depth to layering; buttoned up, it creates a cleaner, more structured line." }, { title: "Textures and details", text: "Camouflage, denim, rhinestones and pearls create a focal point while retaining streetwear versatility." }] },
    shorts: { heading: "Streetwear shorts: proportion and comfort", intro: "MIRAI shorts combine wide legs, treated denim and premium details to balance oversized tees and sneakers.", details: [{ title: "Balanced volume", text: "A wide lower silhouette works well with a boxy tee or a longer top layer." }, { title: "Distinctive finishes", text: "Washes, patches, crystals and applications give each style character without compromising practicality." }] },
    apparel: { heading: "Urban clothing designed for self-expression", intro: "MIRAI collections bring together oversized silhouettes, bold graphics and easy-to-style pieces for a coherent streetwear wardrobe.", details: [{ title: "Consistent silhouettes", text: "Categories work together through relaxed proportions, layering and an urban colour palette." }, { title: "A confident choice", text: "Product pages, sizing and fit notes help you choose the most suitable piece online." }] },
  },
  es: {
    tshirt: { heading: "Camisetas oversize streetwear: corte, peso e identidad", intro: "La selección MIRAI combina proporciones oversize, hombros relajados y gráficos pensados para looks urbanos. Cada modelo incluye información clara sobre talla, composición y corte.", details: [{ title: "Corte oversize y boxy", text: "Los volúmenes amplios y las líneas estructuradas cambian el equilibrio del look: consulta siempre la nota de corte en la ficha." }, { title: "Gráficos y materiales", text: "Los gráficos potentes y los tejidos consistentes dan forma a la prenda y definen una silueta streetwear reconocible." }] },
    headwear: { heading: "Gorras custom: detalles que distinguen cada modelo", intro: "Las gorras custom MIRAI transforman un accesorio streetwear mediante cristales, strass, perlas, tachuelas y acabados seleccionados.", details: [{ title: "Personalización premium", text: "Cada composición realza el logo, la forma y el color de la gorra sin ocultar su diseño original." }, { title: "Información del producto", text: "La ficha muestra imágenes, color, talla e indicaciones de cuidado del modelo seleccionado." }] },
    shirts: { heading: "Camisas oversize para el layering streetwear", intro: "Las camisas MIRAI combinan volúmenes relajados, denim, estampados urbanos y aplicaciones para llevar abiertas sobre una camiseta o como centro del look.", details: [{ title: "Abierta o abotonada", text: "Abierta aporta profundidad al layering; cerrada mantiene una línea más limpia y estructurada." }, { title: "Texturas y detalles", text: "Camouflage, denim, strass y perlas crean un punto focal sin perder versatilidad streetwear." }] },
    shorts: { heading: "Bermudas streetwear: proporción y comodidad", intro: "Las bermudas MIRAI combinan pernera ancha, denim trabajado y detalles premium para equilibrar camisetas oversize y zapatillas.", details: [{ title: "Volumen equilibrado", text: "Una silueta inferior amplia funciona bien con una camiseta boxy o una capa superior más larga." }, { title: "Acabados distintivos", text: "Lavados, parches, cristales y aplicaciones aportan carácter a cada modelo sin renunciar a la practicidad." }] },
    apparel: { heading: "Ropa urbana creada para expresarse", intro: "Las colecciones MIRAI reúnen siluetas oversize, gráficos potentes y prendas fáciles de combinar en un armario streetwear coherente.", details: [{ title: "Siluetas coherentes", text: "Las categorías se combinan mediante proporciones relajadas, layering y una paleta urbana." }, { title: "Una elección segura", text: "Las fichas, las tallas y las notas de corte ayudan a elegir online la prenda adecuada." }] },
  },
  de: {
    tshirt: { heading: "Oversized-Streetwear-T-Shirts: Fit, Gewicht und Identität", intro: "Die MIRAI-Auswahl verbindet Oversized-Proportionen, entspannte Schultern und Grafiken für Urban-Looks. Jedes Modell enthält klare Angaben zu Größe, Material und Passform.", details: [{ title: "Oversized- und Boxy-Fit", text: "Großzügige Volumen und strukturierte Linien verändern die Balance des Looks: Beachte immer den Passformhinweis auf der Produktseite." }, { title: "Grafiken und Materialien", text: "Markante Grafiken und feste Stoffe geben dem Kleidungsstück Form und definieren eine unverwechselbare Streetwear-Silhouette." }] },
    headwear: { heading: "Custom Caps: Details, die jedes Modell besonders machen", intro: "MIRAI Custom Caps verwandeln ein Streetwear-Accessoire durch Kristalle, Strass, Perlen, Nieten und ausgewählte Finishes.", details: [{ title: "Premium-Veredelung", text: "Jede Komposition betont Logo, Form und Farbe der Cap, ohne das ursprüngliche Design zu verdecken." }, { title: "Produktinformationen", text: "Die Produktseite zeigt Bilder, Farbe, Größe und Pflegehinweise für das ausgewählte Modell." }] },
    shirts: { heading: "Oversized-Hemden für Streetwear-Layering", intro: "MIRAI-Hemden kombinieren lockere Volumen, Denim, Urban-Muster und Applikationen – offen über einem T-Shirt oder als Mittelpunkt des Looks.", details: [{ title: "Offen oder geknöpft", text: "Offen getragen entsteht mehr Tiefe im Layering; geschlossen wirkt die Linie klarer und strukturierter." }, { title: "Texturen und Details", text: "Camouflage, Denim, Strass und Perlen setzen einen Fokus und bleiben vielseitig kombinierbar." }] },
    shorts: { heading: "Streetwear-Shorts: Proportion und Komfort", intro: "MIRAI-Shorts verbinden weite Beine, bearbeiteten Denim und Premium-Details als Ausgleich zu Oversized-T-Shirts und Sneakern.", details: [{ title: "Ausgewogenes Volumen", text: "Eine weite untere Silhouette harmoniert mit einem Boxy-T-Shirt oder einer längeren oberen Lage." }, { title: "Charakteristische Finishes", text: "Waschungen, Patches, Kristalle und Applikationen geben jedem Modell Charakter und bleiben alltagstauglich." }] },
    apparel: { heading: "Urban Clothing für individuellen Ausdruck", intro: "MIRAI-Kollektionen vereinen Oversized-Silhouetten, markante Grafiken und leicht kombinierbare Pieces für eine stimmige Streetwear-Garderobe.", details: [{ title: "Stimmige Silhouetten", text: "Die Kategorien greifen durch lockere Proportionen, Layering und eine urbane Farbpalette ineinander." }, { title: "Sicher auswählen", text: "Produktseiten, Größen und Passformhinweise helfen bei der richtigen Online-Auswahl." }] },
  },
  fr: {
    tshirt: { heading: "T-shirts oversize streetwear : coupe, poids et identité", intro: "La sélection MIRAI associe proportions oversize, épaules décontractées et graphismes pensés pour les looks urbains. Chaque modèle présente clairement taille, composition et coupe.", details: [{ title: "Coupe oversize et boxy", text: "Les volumes généreux et les lignes structurées modifient l’équilibre du look : consultez toujours la note de coupe sur la fiche produit." }, { title: "Graphismes et matières", text: "Des graphismes affirmés et des tissus consistants donnent forme au vêtement et définissent une silhouette streetwear reconnaissable." }] },
    headwear: { heading: "Casquettes custom : des détails qui distinguent chaque modèle", intro: "Les casquettes custom MIRAI transforment un accessoire streetwear grâce aux cristaux, strass, perles, clous et finitions sélectionnées.", details: [{ title: "Personnalisation premium", text: "Chaque composition met en valeur le logo, la forme et la couleur de la casquette sans masquer son design d’origine." }, { title: "Informations produit", text: "La fiche présente les images, la couleur, la taille et les conseils d’entretien du modèle choisi." }] },
    shirts: { heading: "Chemises oversize pour un layering streetwear", intro: "Les chemises MIRAI associent volumes décontractés, denim, motifs urbains et applications, ouvertes sur un T-shirt ou au centre du look.", details: [{ title: "Ouverte ou boutonnée", text: "Ouverte, la chemise apporte de la profondeur au layering ; fermée, elle conserve une ligne plus nette et structurée." }, { title: "Textures et détails", text: "Camouflage, denim, strass et perles créent un point focal tout en conservant la polyvalence streetwear." }] },
    shorts: { heading: "Bermudas streetwear : proportions et confort", intro: "Les bermudas MIRAI associent jambes amples, denim travaillé et détails premium pour équilibrer T-shirts oversize et sneakers.", details: [{ title: "Volume équilibré", text: "Une silhouette basse ample fonctionne bien avec un T-shirt boxy ou une couche supérieure plus longue." }, { title: "Finitions distinctives", text: "Délavages, patchs, cristaux et applications donnent du caractère à chaque modèle sans sacrifier la praticité." }] },
    apparel: { heading: "Vêtements urbains conçus pour s’exprimer", intro: "Les collections MIRAI réunissent silhouettes oversize, graphismes affirmés et pièces faciles à associer dans un vestiaire streetwear cohérent.", details: [{ title: "Silhouettes cohérentes", text: "Les catégories dialoguent grâce aux proportions décontractées, au layering et à une palette urbaine." }, { title: "Choisir avec confiance", text: "Les fiches produit, tailles et notes de coupe facilitent le choix du modèle adapté en ligne." }] },
  },
}

export function localizeCategoryGuide(primaryKeyword: string, locale: Locale): CategoryGuide {
  const kind = categoryGuideKinds[primaryKeyword] || "apparel"
  const localized = categoryGuides[locale][kind]
  const shared = {
    it: { label: "Guida alla categoria", footer: "Vuoi capire meglio fit, materiali e abbinamenti? Consulta le nostre", link: "guide streetwear" },
    en: { label: "Category guide", footer: "Want to learn more about fits, materials and styling? Read our", link: "streetwear guides" },
    es: { label: "Guía de la categoría", footer: "¿Quieres saber más sobre cortes, materiales y combinaciones? Consulta nuestras", link: "guías streetwear" },
    de: { label: "Kategorie-Guide", footer: "Mehr über Fits, Materialien und Styling erfahren? Lies unsere", link: "Streetwear-Guides" },
    fr: { label: "Guide de la catégorie", footer: "Vous souhaitez en savoir plus sur les coupes, matières et associations ? Consultez nos", link: "guides streetwear" },
  }[locale]
  return { ...localized, ...shared }
}

function evidence(product: StoreProduct) {
  return [product.name, product.description, ...(product.detail_items || [])].join(" ").toLowerCase()
}

function featureKeys(product: StoreProduct) {
  const text = evidence(product)
  return [
    /cristall|crystal|strass|swarovski|diamond/.test(text) && "crystals",
    /perl/.test(text) && "pearls",
    /borchi|stud/.test(text) && "studs",
    /patch|applicaz/.test(text) && "patches",
    /ricam|embroider/.test(text) && "embroidery",
    /distress|vissuto|consumat|sfilacci/.test(text) && "distressed",
    /washed|slavat|lavaggio|stone wash/.test(text) && "washed",
    /grafica|stampa|graphic|print/.test(text) && "graphic",
    /zip|cerniera/.test(text) && "zip",
    /cappuccio|hood/.test(text) && "hood",
  ].filter(Boolean) as string[]
}

const words: Record<ForeignLocale, Record<string, string>> = {
  en: { crystals: "crystal and rhinestone applications", pearls: "pearl details", studs: "metal studs", patches: "decorative patches and applications", embroidery: "embroidered details", distressed: "a distressed finish", washed: "a washed finish", graphic: "a bold graphic print", zip: "a full-length zip", hood: "an adjustable hood" },
  es: { crystals: "aplicaciones de cristales y strass", pearls: "detalles de perlas", studs: "tachuelas metálicas", patches: "parches y aplicaciones decorativas", embroidery: "detalles bordados", distressed: "un acabado distressed", washed: "un acabado lavado", graphic: "un gráfico frontal impactante", zip: "una cremallera completa", hood: "una capucha ajustable" },
  de: { crystals: "Kristall- und Strassapplikationen", pearls: "Perlendetails", studs: "Metallnieten", patches: "dekorative Patches und Applikationen", embroidery: "gestickte Details", distressed: "ein Distressed-Finish", washed: "ein Washed-Finish", graphic: "einen markanten Grafikprint", zip: "einen durchgehenden Reißverschluss", hood: "eine verstellbare Kapuze" },
  fr: { crystals: "des applications de cristaux et de strass", pearls: "des détails perlés", studs: "des clous métalliques", patches: "des patchs et applications décoratives", embroidery: "des détails brodés", distressed: "une finition distressed", washed: "une finition délavée", graphic: "un graphisme frontal affirmé", zip: "un zip intégral", hood: "une capuche réglable" },
}

function naturalList(values: string[], locale: ForeignLocale) {
  if (values.length < 2) return values[0] || ""
  const conjunction = locale === "es" ? " y " : locale === "de" ? " und " : locale === "fr" ? " et " : " and "
  return `${values.slice(0, -1).join(", ")}${conjunction}${values.at(-1)}`
}

function productKind(category: string, locale: ForeignLocale) {
  const rows: Record<string, Record<ForeignLocale, string>> = {
    "t-shirt": { en: "oversized streetwear T-shirt", es: "camiseta oversize streetwear", de: "Oversized-Streetwear-T-Shirt", fr: "T-shirt oversize streetwear" },
    camicie: { en: "oversized streetwear shirt", es: "camisa oversize streetwear", de: "Oversized-Streetwear-Hemd", fr: "chemise oversize streetwear" },
    canotte: { en: "sleeveless streetwear top", es: "top streetwear sin mangas", de: "ärmelloses Streetwear-Top", fr: "haut streetwear sans manches" },
    shorts: { en: "baggy streetwear shorts", es: "bermudas baggy streetwear", de: "Baggy-Streetwear-Shorts", fr: "bermuda baggy streetwear" },
    jeans: { en: "relaxed streetwear jeans", es: "vaqueros streetwear de corte relajado", de: "locker geschnittene Streetwear-Jeans", fr: "jean streetwear à coupe décontractée" },
    felpe: { en: "streetwear hoodie", es: "sudadera streetwear", de: "Streetwear-Hoodie", fr: "sweat streetwear" },
    sweatshirts: { en: "streetwear sweatshirt", es: "sudadera streetwear", de: "Streetwear-Sweatshirt", fr: "sweatshirt streetwear" },
    headwear: { en: "custom streetwear cap", es: "gorra custom streetwear", de: "individuelle Streetwear-Cap", fr: "casquette custom streetwear" },
    profumi: { en: "MIRAI fragrance", es: "fragancia MIRAI", de: "MIRAI-Duft", fr: "parfum MIRAI" },
    "mirai-parfum-exlusive": { en: "MIRAI fragrance", es: "fragancia MIRAI", de: "MIRAI-Duft", fr: "parfum MIRAI" },
  }
  return rows[category]?.[locale] || ({ en: "streetwear piece", es: "prenda streetwear", de: "Streetwear-Piece", fr: "pièce streetwear" } as const)[locale]
}

function localizedDescription(product: StoreProduct, locale: ForeignLocale, name: string, color: string) {
  const kind = productKind(product.category, locale)
  const features = naturalList(featureKeys(product).slice(0, 4).map((key) => words[locale][key]), locale)
  const inColor = color || ({ en: "the selected colour", es: "el color seleccionado", de: "der gewählten Farbe", fr: "le coloris sélectionné" } as const)[locale]
  const feature = features || ({ en: "carefully selected construction details", es: "detalles de confección cuidadosamente seleccionados", de: "sorgfältig ausgewählte Konstruktionsdetails", fr: "des détails de confection soigneusement sélectionnés" } as const)[locale]
  if (locale === "en") return `${name} is ${/^[aeiou]/i.test(kind) ? "an" : "a"} ${kind} in ${inColor}, defined by ${feature}. The silhouette and finishes are designed for contemporary urban outfits while preserving comfort and a distinctive MIRAI identity.`
  if (locale === "es") return `${name}: ${kind} en ${inColor}, con ${feature}. La silueta y los acabados están pensados para looks urbanos contemporáneos, manteniendo comodidad y una identidad MIRAI reconocible.`
  if (locale === "de") return `${name}: ${kind} in ${inColor}, geprägt durch ${feature}. Silhouette und Verarbeitung sind für zeitgemäße Urban-Looks konzipiert und verbinden Komfort mit einer unverwechselbaren MIRAI-Identität.`
  return `${name} : ${kind} en ${inColor}, avec ${feature}. La silhouette et les finitions sont pensées pour des looks urbains contemporains, tout en préservant le confort et l’identité distinctive de MIRAI.`
}

function localizedFit(product: StoreProduct, locale: ForeignLocale) {
  const text = evidence(product)
  const fit = /baggy|ampia|oversize|rilassat/.test(text) ? "relaxed" : "regular"
  const sizes = product.sizes?.length ? product.sizes.join(", ") : ""
  if (locale === "en") return `${fit === "relaxed" ? "Relaxed, streetwear-inspired fit" : "Regular fit"}.${sizes ? ` Available sizes: ${sizes}.` : ""}`
  if (locale === "es") return `${fit === "relaxed" ? "Corte relajado de inspiración streetwear" : "Corte regular"}.${sizes ? ` Tallas disponibles: ${sizes}.` : ""}`
  if (locale === "de") return `${fit === "relaxed" ? "Lockere, Streetwear-inspirierte Passform" : "Reguläre Passform"}.${sizes ? ` Verfügbare Größen: ${sizes}.` : ""}`
  return `${fit === "relaxed" ? "Coupe décontractée d’inspiration streetwear" : "Coupe regular"}.${sizes ? ` Tailles disponibles : ${sizes}.` : ""}`
}

function localizedDetails(product: StoreProduct, locale: ForeignLocale, color: string) {
  const category = product.category
  const bases: Record<ForeignLocale, string[]> = {
    en: [`Product type: ${productKind(category, locale)}`, `Colour: ${color || "as pictured"}`],
    es: [`Tipo de producto: ${productKind(category, locale)}`, `Color: ${color || "como en la imagen"}`],
    de: [`Produkttyp: ${productKind(category, locale)}`, `Farbe: ${color || "wie abgebildet"}`],
    fr: [`Type de produit : ${productKind(category, locale)}`, `Couleur : ${color || "comme sur la photo"}`],
  }
  return [...bases[locale], ...featureKeys(product).slice(0, 5).map((key) => words[locale][key])]
}

function localizedComposition(product: StoreProduct, locale: ForeignLocale) {
  const source = `${product.composition || ""} ${product.description || ""}`.toLowerCase()
  const isDenim = /denim|jeans/.test(source) || ["shorts", "jeans", "camicie"].includes(product.category)
  const isCotton = /cotone|cotton/.test(source) || ["t-shirt", "canotte", "felpe", "sweatshirts"].includes(product.category)
  if (locale === "en") return `${isDenim ? "Cotton denim" : isCotton ? "Cotton fabric" : "Selected materials"}. Check the internal label for the complete fibre composition.`
  if (locale === "es") return `${isDenim ? "Denim de algodón" : isCotton ? "Tejido de algodón" : "Materiales seleccionados"}. Consulta la etiqueta interior para conocer la composición completa de las fibras.`
  if (locale === "de") return `${isDenim ? "Baumwoll-Denim" : isCotton ? "Baumwollgewebe" : "Ausgewählte Materialien"}. Die vollständige Faserzusammensetzung steht auf dem Innenetikett.`
  return `${isDenim ? "Denim de coton" : isCotton ? "Tissu en coton" : "Matières sélectionnées"}. Consultez l’étiquette intérieure pour la composition complète des fibres.`
}

function localizedCare(locale: ForeignLocale) {
  if (locale === "en") return "Follow the instructions on the internal care label. Wash inside out with similar colours and avoid direct heat on prints or applications."
  if (locale === "es") return "Sigue las instrucciones de la etiqueta interior. Lava la prenda del revés con colores similares y evita el calor directo sobre estampados o aplicaciones."
  if (locale === "de") return "Pflegehinweise auf dem Innenetikett beachten. Auf links mit ähnlichen Farben waschen und direkte Hitze auf Prints oder Applikationen vermeiden."
  return "Suivez les instructions de l’étiquette d’entretien. Lavez sur l’envers avec des couleurs similaires et évitez la chaleur directe sur les imprimés ou applications."
}

export function localizeProduct(product: StoreProduct, locale: Locale) {
  if (locale === "it") {
    return {
      name: product.name,
      description: product.description || "",
      colorName: product.color_name || "",
      fitNote: product.fit_note || "",
      detailItems: product.detail_items || [],
      composition: product.composition || "",
      care: product.care || "",
    }
  }
  const name = translateProductName(product.name, locale)
  const colorName = localizeColor(product.color_name, locale)
  return {
    name,
    colorName,
    description: localizedDescription(product, locale, name, colorName),
    fitNote: localizedFit(product, locale),
    detailItems: localizedDetails(product, locale, colorName),
    composition: localizedComposition(product, locale),
    care: localizedCare(locale),
  }
}
