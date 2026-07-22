export type MiraiSupplierCatalogProduct = {
  name: string
  description: string
  price: number
  category: "t-shirt" | "canotte"
  image_url: string
  image_gallery: string[]
  sizes: string[]
  stock_by_size: Record<string, number>
  in_stock: boolean
  is_new: boolean
  brand: "MIRAI"
  supplier_sku: string
  color_name: string
  color_hex: string | null
  fit_note: string
  detail_items: string[]
  composition: string | null
  care: string | null
}

// Generated from docs/mirai-supplier-catalog.md. Products remain unavailable
// until sizes and stock are confirmed in the admin panel.
export const MIRAI_SUPPLIER_CATALOG = [
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
] as const satisfies readonly MiraiSupplierCatalogProduct[]

