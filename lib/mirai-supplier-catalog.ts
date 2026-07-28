export type MiraiSupplierCatalogProduct = {
  name: string
  description: string
  price: number
  category: "t-shirt" | "canotte" | "jeans" | "pantaloni" | "shorts" | "profumi"
  image_url: string
  image_gallery: string[]
  sizes: string[]
  stock_by_size: Record<string, number>
  in_stock: boolean
  is_new: boolean
  brand: "MIRAI" | "Minimal"
  supplier_sku: string
  color_name: string
  color_hex: string | null
  fit_note: string
  detail_items: string[]
  composition: string | null
  care: string | null
}

// Generated from docs/mirai-supplier-catalog.md.
const MIRAI_SUPPLIER_CATALOG_BASE = [
  {
    "name": "MIRAI Divine Garden Tee – White",
    "description": "T-shirt oversize bianca dal carattere barocco, costruita attorno a una maxi grafica con cherubini, ali e dettagli botanici. Il contrasto tra la base pulita e la stampa scura crea un capo streetwear scenografico, pensato per diventare il centro dell’outfit.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/divine-garden-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/divine-garden-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-DIVINE-001",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Divine Garden",
      "Motivo con cherubini e cornice botanica",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base bianca con stampa multicolore",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Hope Angel Tee – White",
    "description": "T-shirt oversize bianca con una composizione angelica dall’estetica vintage e distressed. La stampa frontale nei toni seppia dialoga con la grafica posteriore ad alto contrasto, per un look streetwear completo da ogni angolazione.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/hope-angel-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/hope-angel-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-HOPE-002",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica angelica frontale in stile vintage",
      "Stampa posteriore oversize ad alto contrasto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Palette bianco, nero e seppia",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Blind Cupid Tee – Black",
    "description": "T-shirt oversize nera con Cupido bendato, arco centrale e ali scolpite in una grafica dal forte impatto visivo. Il lettering luminoso e la palette fredda trasformano un’immagine classica in un pezzo urban contemporaneo.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/blind-cupid-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/blind-cupid-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-CUPID-BLK-003",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Blind Cupid",
      "Lettering decorativo effetto brillante",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base nera con toni grigio, blu e argento",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Blind Cupid Tee – Pink",
    "description": "Variante rosa della Blind Cupid Tee, con maxi stampa scultorea e lettering argentato. Il colore acceso alleggerisce l’immaginario gotico della grafica e crea un contrasto deciso, perfetto per styling streetwear fuori dagli schemi.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/blind-cupid-pink-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/blind-cupid-pink-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-CUPID-PNK-004",
    "color_name": "Rosa",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Blind Cupid",
      "Lettering decorativo effetto brillante",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base rosa con stampa grigio e nero",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Guardian Prayer Tee – Black",
    "description": "T-shirt oversize nera con angelo bendato in preghiera, ali dorate e dettagli pittorici di ispirazione rinascimentale. Una grafica ricca e stratificata che unisce iconografia sacra, atmosfere dark e linguaggio streetwear.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/guardian-prayer-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/guardian-prayer-black-01.jpeg",
      "/products/mirai-supplier/guardian-prayer-black-02.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-GUARDIAN-BLK-005",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Guardian Prayer",
      "Dettagli pittorici nei toni oro e avorio",
      "Lettering decorativo sul petto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Celestial Rider Tee – Black",
    "description": "T-shirt oversize nera con un giovane angelo a cavallo, raccontato attraverso una maxi stampa dai toni notturni. Il soggetto classico viene reinterpretato con proporzioni bold e una presenza grafica ideale per outfit urban monocromatici.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/celestial-rider-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/celestial-rider-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-RIDER-006",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Celestial Rider",
      "Soggetto angelico con cavallo bianco",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Palette nero, blu notte e avorio",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Mixed Emotion Tee – Black",
    "description": "T-shirt oversize nera con scena frontale dal tono cinematico e lettering Mixed Emotion sul retro. La doppia stampa crea un capo completo e dinamico, con accenti rosso fuoco che emergono sulla base scura.",
    "price": 85,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/mixed-emotion-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/mixed-emotion-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-MIXED-007",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica frontale a tema Mixed Emotion",
      "Maxi lettering posteriore",
      "Stampa fronte e retro",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Liberty Speed Sleeveless – Washed Black",
    "description": "Canotta oversize nera slavata con taglio smanicato e grafiche urban dedicate alla Statua della Libertà. Il fronte illustrato e il maxi simbolo sul retro costruiscono una silhouette decisa, pensata per layering e outfit estivi.",
    "price": 85,
    "category": "canotte",
    "image_url": "/products/mirai-supplier/liberty-speed-sleeveless-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/liberty-speed-sleeveless-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-LIBERTY-008",
    "color_name": "Nero slavato",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Modello smanicato oversize",
      "Grafica Liberty frontale",
      "Maxi stampa posteriore",
      "Effetto washed e vissuto",
      "Spalla ampia e giromanica aperto",
      "Tipologia: Canotta / smanicato streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Astro Riders Tee – Black",
    "description": "T-shirt oversize nera con grafica spaziale multicolore, tra razzi, personaggi e suggestioni retro-futuristiche. La stampa ad alta presenza visiva porta energia pop all’interno di una silhouette streetwear rilassata.",
    "price": 70,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/astro-riders-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/astro-riders-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-ASTRO-BLK-009",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Astro Riders",
      "Illustrazione retro-futuristica multicolore",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base nera ad alto contrasto",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Astro Riders Tee – White",
    "description": "Variante bianca della Astro Riders Tee, caratterizzata da una maxi grafica retro-futuristica con razzi e personaggi illustrati. La base chiara amplifica i colori della stampa e rende il capo immediato da abbinare.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/astro-riders-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/astro-riders-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-ASTRO-WHT-010",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Astro Riders",
      "Illustrazione retro-futuristica multicolore",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base bianca con stampa ad alto contrasto",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Guardian Prayer Tee – Sand",
    "description": "Variante sabbia della Guardian Prayer Tee, con maxi stampa tono su tono ispirata alla pittura classica. Le sfumature beige, oro e avorio danno profondità alla grafica mantenendo un’estetica morbida e premium.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/guardian-prayer-sand-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/guardian-prayer-sand-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-GUARDIAN-SND-011",
    "color_name": "Sabbia",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Guardian Prayer",
      "Palette tono su tono sabbia e oro",
      "Lettering decorativo sul petto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Liberty Dreams Tee – Vintage Black",
    "description": "T-shirt oversize nera dall’effetto vintage con ritratto pop e richiami alla Statua della Libertà. I colori saturi e il trattamento grafico consumato donano al capo un’attitudine metropolitana immediata.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/liberty-dreams-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/liberty-dreams-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-DREAMS-LIB-012",
    "color_name": "Nero vintage",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Liberty Dreams",
      "Stile pop con finitura vintage",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base nera con accenti turchese, rosa e giallo",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Wild Valley Tiger Tee – White",
    "description": "T-shirt oversize bianca con tigre centrale, lettering college e dettagli grafici effetto lightning. Il mix tra immaginario varsity e stampa animalier crea un pezzo energico, facile da inserire in look streetwear quotidiani.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/wild-valley-tiger-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/wild-valley-tiger-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-TIGER-013",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale con tigre",
      "Lettering college oversize",
      "Dettagli effetto lightning",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Court Bulldog Tee – Black",
    "description": "T-shirt oversize nera con bulldog da playground, pallone da basket e lettering college. La grafica ruvida e stratificata richiama le divise sportive vintage, reinterpretate in chiave urban.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/court-bulldog-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/court-bulldog-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-BULLDOG-014",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Court Bulldog",
      "Tema basket e iconografia college",
      "Effetto stampa vissuto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Night Panther Tee – Black",
    "description": "T-shirt oversize nera con pantera blu elettrico, dettagli metallici e lettering oversize. Un soggetto aggressivo e notturno che costruisce un forte contrasto sulla base black.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/night-panther-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/night-panther-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-PANTHER-015",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Night Panther",
      "Palette blu elettrico, argento e nero",
      "Dettagli illustrati ad alto contrasto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Target Practice Tee – Washed Red",
    "description": "T-shirt oversize rossa con trattamento washed e grafica frontale ispirata ai bersagli da poligono. Le tonalità consumate e il layout tipografico donano al capo un aspetto vissuto e autenticamente urban.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/target-practice-red-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/target-practice-red-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-TARGET-016",
    "color_name": "Rosso slavato",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica frontale Target Practice",
      "Effetto washed e vissuto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base rosso slavato con stampa tono su tono",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Court Clash Tee – Black",
    "description": "T-shirt oversize nera con una scena da playground in movimento, sviluppata in una stampa multicolore che attraversa il fronte. Il mix di blu, giallo e rosa crea un’estetica sportiva dal taglio illustrato.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/court-clash-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/court-clash-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-COURT-017",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Court Clash",
      "Tema basket e playground",
      "Stampa multicolore estesa",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Grit & Dreams Tee – White",
    "description": "T-shirt oversize bianco sporco con grafica fotografica e lettering varsity dai toni giallo e rosso. L’impostazione da poster vintage racconta ambizione e cultura street in una composizione forte ma facile da indossare.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/grit-dreams-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/grit-dreams-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-GRIT-018",
    "color_name": "Bianco sporco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica frontale Grit & Dreams",
      "Layout ispirato ai poster vintage",
      "Lettering varsity oversize",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Neon Racing Tee – White",
    "description": "T-shirt oversize bianca con grafiche racing in stile arcade, auto sportive e dettagli neon. La stampa fronte-retro combina velocità, colori saturi e lettering tecnico per un look Y2K ad alto impatto.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/neon-racing-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/neon-racing-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-RACING-WHT-019",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica racing frontale con auto sportive",
      "Maxi stampa posteriore coordinata",
      "Stampa fronte e retro",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Valley Athletic Bulldog Tee – White",
    "description": "T-shirt oversize bianco sporco con bulldog atletico e lettering college effetto vintage. Un capo che riprende l’estetica delle uniformi universitarie e la porta in una silhouette streetwear rilassata.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/valley-athletic-bulldog-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/valley-athletic-bulldog-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-ATHLETIC-020",
    "color_name": "Bianco sporco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Athletic Bulldog",
      "Lettering college effetto vintage",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Palette bianco, azzurro, giallo e bordeaux",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Jamaica Crew Tee – Black",
    "description": "T-shirt oversize nera con bandiera giamaicana, gruppo in silhouette e dettagli grafici verde acido. La palette intensa rende omaggio alla cultura caraibica con un linguaggio visivo contemporaneo e urbano.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/jamaica-crew-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/jamaica-crew-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-JAMAICA-BLK-021",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Jamaica Crew",
      "Bandiera e silhouette in primo piano",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Palette nero, verde e giallo",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Sacred Static Tee – Black",
    "description": "T-shirt oversize nera con volto monocromatico, croce centrale e lettering gotico. Il trattamento ruvido in bianco e nero crea un’estetica dark essenziale, costruita per outfit total black.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/sacred-static-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/sacred-static-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-STATIC-022",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Sacred Static",
      "Illustrazione monocromatica con croce",
      "Lettering gotico",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Golden Machine Tee – Black",
    "description": "T-shirt oversize nera con composizione meccanica in giallo metallico e lettering geometrico. Il disegno tecnico destrutturato richiama motori, velocità e cultura industrial, mantenendo una palette netta e sofisticata.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/golden-machine-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/golden-machine-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-MACHINE-023",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Golden Machine",
      "Dettagli meccanici e lettering geometrico",
      "Palette nero e giallo metallico",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Electric Reaper Tee – Black",
    "description": "T-shirt oversize nera con scheletro attraversato da scariche blu elettrico. La grafica verticale, intensa e luminosa, trasforma un immaginario dark in un capo streetwear dal forte impatto.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/electric-reaper-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/electric-reaper-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-REAPER-024",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Electric Reaper",
      "Effetto fulmine blu elettrico",
      "Illustrazione verticale ad alto contrasto",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Neon Racing Tee – Black",
    "description": "Variante nera della Neon Racing Tee, con auto sportive, fiamme e dettagli cromatici ispirati al mondo arcade. La base scura rende ancora più vivi il blu, il magenta e il giallo della maxi stampa.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/neon-racing-black-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/neon-racing-black-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-RACING-BLK-025",
    "color_name": "Nero",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Maxi grafica frontale Neon Racing",
      "Auto sportive e dettagli arcade",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Base nera con stampa multicolore",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  },
  {
    "name": "MIRAI Jamaica Crew Tee – White",
    "description": "Variante bianca della Jamaica Crew Tee, con grafica verde e nera sviluppata sia sul fronte sia sul retro. Il doppio artwork crea un capo completo, fresco e immediatamente riconoscibile.",
    "price": 120,
    "category": "t-shirt",
    "image_url": "/products/mirai-supplier/jamaica-crew-white-01.jpeg",
    "image_gallery": [
      "/products/mirai-supplier/jamaica-crew-white-01.jpeg"
    ],
    "sizes": [],
    "stock_by_size": {},
    "in_stock": false,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-JAMAICA-WHT-026",
    "color_name": "Bianco",
    "color_hex": null,
    "fit_note": "Vestibilità oversize d’ispirazione streetwear.",
    "detail_items": [
      "Grafica Jamaica Crew frontale",
      "Maxi stampa posteriore coordinata",
      "Stampa fronte e retro",
      "Girocollo e manica corta",
      "Vestibilità ampia d’ispirazione streetwear",
      "Tipologia: T-shirt grafica streetwear",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": null
  }
  ,
  {
    "name": "MIRAI Night Spark Crystal Shorts - Black",
    "description": "Shorts neri dal taglio ampio con lavaggio sfumato e una fitta applicazione di cristalli su tutta la superficie. La costruzione essenziale lascia spazio alla texture luminosa, mentre i lacci lunghi completano un capo streetwear deciso ma facile da abbinare.",
    "price": 140,
    "category": "shorts",
    "image_url": "/products/mirai-supplier/night-spark-crystal-shorts-black-01.webp",
    "image_gallery": ["/products/mirai-supplier/night-spark-crystal-shorts-black-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-NIGHT-SPARK-027",
    "color_name": "Nero",
    "color_hex": "#111111",
    "fit_note": "Vestibilita baggy. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Applicazioni crystal all-over", "Lavaggio nero con sfumature grigie", "Lacci lunghi a contrasto", "Taglio ampio sotto il ginocchio", "Vista fronte e retro"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Shadow Script Distressed Jeans - Black",
    "description": "Jeans lunghi neri con costruzione a pannelli, lavaggio vissuto e dettagli distressed distribuiti sulla gamba. La maxi applicazione script sul fronte aggiunge luce e carattere a una silhouette ampia di ispirazione urban.",
    "price": 180,
    "category": "jeans",
    "image_url": "/products/mirai-supplier/shadow-script-distressed-jeans-black-01.webp",
    "image_gallery": ["/products/mirai-supplier/shadow-script-distressed-jeans-black-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-SHADOW-SCRIPT-028",
    "color_name": "Nero washed",
    "color_hex": "#1b1d1d",
    "fit_note": "Vestibilita baggy a gamba ampia. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Denim nero con lavaggio distressed", "Maxi applicazione script con dettagli crystal", "Costruzione frontale a pannelli", "Gamba lunga e ampia", "Vista fronte e retro"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Valley Patchwork Jeans - Blue",
    "description": "Jeans lunghi in denim blu washed con una composizione ricca di patch colorate e maxi lettering applicato. La gamba ampia e i lacci extra long costruiscono una presenza forte, pensata per outfit streetwear ad alto impatto.",
    "price": 180,
    "category": "jeans",
    "image_url": "/products/mirai-supplier/valley-patchwork-jeans-blue-01.webp",
    "image_gallery": ["/products/mirai-supplier/valley-patchwork-jeans-blue-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-VALLEY-JEANS-BLU-029",
    "color_name": "Blu washed",
    "color_hex": "#344755",
    "fit_note": "Vestibilita baggy a gamba ampia. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Denim blu effetto washed", "Patch ricamate multicolore", "Maxi lettering frontale applicato", "Lacci lunghi a contrasto", "Gamba ampia con costruzione a pannelli"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Valley Patchwork Shorts - Brown",
    "description": "Shorts in denim marrone washed con patch multicolore, maxi lettering applicato e dettagli crystal. Il taglio lungo e rilassato bilancia la ricchezza grafica, creando un capo centrale per look urban e oversize.",
    "price": 140,
    "category": "shorts",
    "image_url": "/products/mirai-supplier/valley-patchwork-shorts-brown-01.webp",
    "image_gallery": ["/products/mirai-supplier/valley-patchwork-shorts-brown-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-VALLEY-SHORT-BRN-030",
    "color_name": "Marrone washed",
    "color_hex": "#6b4c3c",
    "fit_note": "Vestibilita baggy con lunghezza sotto il ginocchio. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Denim marrone effetto washed", "Patch ricamate multicolore", "Maxi lettering con dettagli crystal", "Lacci lunghi a contrasto", "Taglio ampio sotto il ginocchio"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Valley Patchwork Shorts - Black",
    "description": "Shorts in denim nero washed costruiti attorno a patch multicolore e maxi lettering con applicazioni luminose. La silhouette baggy e i lacci lunghi amplificano l'attitudine streetwear del modello.",
    "price": 140,
    "category": "shorts",
    "image_url": "/products/mirai-supplier/valley-patchwork-shorts-black-01.webp",
    "image_gallery": ["/products/mirai-supplier/valley-patchwork-shorts-black-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-VALLEY-SHORT-BLK-031",
    "color_name": "Nero washed",
    "color_hex": "#202020",
    "fit_note": "Vestibilita baggy con lunghezza sotto il ginocchio. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Denim nero effetto washed", "Patch ricamate multicolore", "Maxi lettering con dettagli crystal", "Lacci lunghi a contrasto", "Taglio ampio sotto il ginocchio"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Valley Patchwork Shorts - Blue",
    "description": "Shorts in denim blu washed con patch ricamate, maxi lettering applicato e dettagli crystal. Una variante energica dal volume ampio, rifinita con lacci extra long per un'estetica urban riconoscibile.",
    "price": 140,
    "category": "shorts",
    "image_url": "/products/mirai-supplier/valley-patchwork-shorts-blue-01.webp",
    "image_gallery": ["/products/mirai-supplier/valley-patchwork-shorts-blue-01.webp"],
    "sizes": ["44", "46", "48", "50", "52", "54", "56"],
    "stock_by_size": { "44": 10, "46": 10, "48": 10, "50": 10, "52": 10, "54": 10, "56": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-VALLEY-SHORT-BLU-032",
    "color_name": "Blu washed",
    "color_hex": "#344f68",
    "fit_note": "Vestibilita baggy con lunghezza sotto il ginocchio. Taglie disponibili dalla 44 alla 56.",
    "detail_items": ["Denim blu effetto washed", "Patch ricamate multicolore", "Maxi lettering con dettagli crystal", "Lacci lunghi a contrasto", "Taglio ampio sotto il ginocchio"],
    "composition": null,
    "care": "Seguire le istruzioni riportate sull'etichetta interna."
  },
  {
    "name": "MIRAI Santa Madre Studded Canotta - White",
    "description": "Canotta bianca dal taglio ampio con lettering Santa Madre rosso sul fronte e applicazioni metalliche lungo il girocollo. La linea pulita e le spalle decise incontrano dettagli luminosi per un capo estivo riconoscibile, pensato per outfit streetwear essenziali.",
    "price": 45,
    "category": "canotte",
    "image_url": "/products/mirai-supplier/santa-madre-canotta-white-01.webp",
    "image_gallery": ["/products/mirai-supplier/santa-madre-canotta-white-01.webp"],
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "stock_by_size": { "XS": 10, "S": 10, "M": 10, "L": 10, "XL": 10, "XXL": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "Minimal",
    "supplier_sku": "MIRAI-SANTA-MADRE-033",
    "color_name": "Bianco",
    "color_hex": "#f4f2ee",
    "fit_note": "Vestibilita ampia e rilassata. Disponibile dalla XS alla XXL.",
    "detail_items": [
      "Lettering Santa Madre rosso sul fronte",
      "Applicazioni metalliche lungo il girocollo",
      "Costruzione smanicata",
      "Taglio ampio d'ispirazione streetwear",
      "Colore bianco",
      "Destinazione: Unisex"
    ],
    "composition": null,
    "care": "Lavare seguendo le istruzioni riportate sull'etichetta interna e proteggere le applicazioni durante il lavaggio."
  },
  {
    "name": "MIRAI Genesi I Extrait de Parfum 100 ml",
    "description": "Genesi I e l'atto d'origine della profumeria MIRAI: un extrait de parfum unisex che apre con bergamotto e matcha, evolve in un cuore floreale di rosa, magnolia e gelsomino e si posa su note muschiate, ambra e vaniglia assoluta. Una firma intensa, contemporanea e riconoscibile in flacone da 100 ml.",
    "price": 59.99,
    "category": "profumi",
    "image_url": "/products/mirai-supplier/genesi-i-profumo-100ml-01.webp",
    "image_gallery": ["/products/mirai-supplier/genesi-i-profumo-100ml-01.webp"],
    "sizes": ["100 ML"],
    "stock_by_size": { "100 ML": 10 },
    "in_stock": true,
    "is_new": true,
    "brand": "MIRAI",
    "supplier_sku": "MIRAI-GENESI-I-034",
    "color_name": "Viola sfumato",
    "color_hex": "#5f3b91",
    "fit_note": "Formato unico da 100 ml.",
    "detail_items": [
      "Extrait de Parfum",
      "Formato 100 ml",
      "Apertura: bergamotto e matcha",
      "Cuore: rosa, magnolia e gelsomino",
      "Fondo: note muschiate, ambra e vaniglia assoluta",
      "Profumazione unisex",
      "Flacone in vetro viola sfumato con tappo nero"
    ],
    "composition": null,
    "care": "Conservare in luogo fresco e asciutto, lontano da luce diretta e fonti di calore."
  }
] as const satisfies readonly MiraiSupplierCatalogProduct[]

const DEFAULT_MIRAI_SIZES = ["S", "M", "L", "XL", "XXL"]
const DEFAULT_MIRAI_STOCK = { S: 10, M: 10, L: 10, XL: 10, XXL: 10 }

// Products with a supplier-specific size run keep it; the rest use the
// standard MIRAI apparel sizes. Stock is always tracked per size.
export const MIRAI_SUPPLIER_CATALOG: readonly MiraiSupplierCatalogProduct[] =
  MIRAI_SUPPLIER_CATALOG_BASE.map((product) => {
    const isMinimalProduct = product.brand === "Minimal"

    return {
      ...product,
      name: product.name.replace(/^MIRAI\s+/i, ""),
      image_gallery: [...product.image_gallery],
      sizes: product.sizes.length > 0 ? [...product.sizes] : [...DEFAULT_MIRAI_SIZES],
      stock_by_size: Object.keys(product.stock_by_size).length > 0
        ? { ...product.stock_by_size }
        : { ...DEFAULT_MIRAI_STOCK },
      in_stock: true,
      detail_items: [...product.detail_items],
      supplier_profile: isMinimalProduct ? "minimal" as const : "mirai" as const,
      gtin: null,
      shipping_min_days: isMinimalProduct ? null : 7,
      shipping_max_days: isMinimalProduct ? null : 12,
    }
  })

