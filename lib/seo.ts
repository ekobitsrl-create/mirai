import type { Metadata } from "next"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"

export const SEO_BRAND_NAME = "MIRAI LAB STORE"
export const SEO_SHORT_BRAND_NAME = "MIRAI"
export const SEO_DEFAULT_IMAGE = "/images/hero-storefront.jpg"

type SeoMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string | null
  absoluteTitle?: boolean
}

export function buildSeoMetadata({
  title,
  description,
  path,
  keywords = [],
  image = SEO_DEFAULT_IMAGE,
  absoluteTitle = false,
}: SeoMetadataInput): Metadata {
  const canonical = getAbsoluteUrl(path)
  const imageUrl = image ? getAbsoluteUrl(image) : undefined

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: SEO_BRAND_NAME,
      url: canonical,
      title,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: `${title} - ${SEO_BRAND_NAME}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export type CategorySeo = {
  primaryKeyword: string
  title: string
  description: string
  heading: string
  intro: string
  details: Array<{ title: string; text: string }>
  keywords: string[]
}

const TSHIRT_SEO: CategorySeo = {
  primaryKeyword: "t-shirt oversize streetwear",
  title: "T-shirt oversize streetwear da uomo",
  description:
    "Scopri le t-shirt oversize streetwear MIRAI: fit boxy, grafiche urban e cotone strutturato. Acquista online con spedizione gratuita.",
  heading: "T-shirt oversize streetwear: fit, peso e identità",
  intro:
    "La selezione MIRAI unisce proporzioni oversize, spalle rilassate e grafiche pensate per outfit urban. Dalle heavy tee alle silhouette boxy, ogni modello è presentato con indicazioni su taglia, composizione e vestibilità.",
  details: [
    {
      title: "Fit oversize e boxy",
      text: "Volumi ampi e linee più corte o strutturate cambiano l'equilibrio del look: controlla sempre la nota di vestibilità nella scheda prodotto.",
    },
    {
      title: "Grafiche e cotone pesante",
      text: "Le t-shirt grafiche oversize e i tessuti più consistenti danno forma al capo e rendono la silhouette più netta.",
    },
  ],
  keywords: [
    "t-shirt oversize streetwear",
    "t-shirt streetwear uomo",
    "magliette urban uomo",
    "t-shirt grafiche oversize",
    "t-shirt distressed uomo",
    "t-shirt cotone pesante streetwear",
    "t-shirt boxy fit uomo",
  ],
}

const HATS_SEO: CategorySeo = {
  primaryKeyword: "cappelli custom",
  title: "Cappelli custom e streetwear",
  description:
    "Cappelli custom MIRAI con cristalli, strass e dettagli premium. Scopri online i modelli streetwear personalizzati anche a Catania.",
  heading: "Cappelli custom: dettagli che rendono unico ogni pezzo",
  intro:
    "I cappelli custom MIRAI trasformano un accessorio streetwear in un elemento personale. Cristalli, strass e applicazioni vengono scelti per dialogare con forma, colore e grafica del modello di partenza.",
  details: [
    {
      title: "Personalizzazione premium",
      text: "La composizione dei dettagli è studiata per mantenere leggibile il design del cappello e creare un risultato equilibrato.",
    },
    {
      title: "Online e a Catania",
      text: "Puoi acquistare i modelli disponibili online e seguire l'apertura del MIRAI LAB STORE di Catania per scoprire il progetto fisico.",
    },
  ],
  keywords: [
    "cappelli custom",
    "cappelli custom con cristalli",
    "cappelli con strass",
    "cappelli streetwear uomo",
    "cappelli personalizzati premium",
    "cappelli custom Catania",
  ],
}

const SHIRTS_SEO: CategorySeo = {
  primaryKeyword: "camicie oversize uomo",
  title: "Camicie oversize uomo streetwear",
  description:
    "Camicie oversize uomo dallo stile streetwear: volumi rilassati, pattern urban e modelli camouflage selezionati da MIRAI.",
  heading: "Camicie oversize uomo per un layering streetwear",
  intro:
    "Una camicia oversize può funzionare come strato leggero sopra una tee oppure come protagonista del look. MIRAI seleziona volumi rilassati, pattern urban e proporzioni facili da inserire nel guardaroba quotidiano.",
  details: [
    {
      title: "Aperta o abbottonata",
      text: "Indossata aperta crea profondità; chiusa mantiene una linea più pulita. La scelta dipende dal volume della t-shirt e dei pantaloni abbinati.",
    },
    {
      title: "Pattern urban",
      text: "Camouflage, texture e colori neutri costruiscono un punto focale senza perdere la versatilità tipica dello streetwear.",
    },
  ],
  keywords: ["camicie oversize uomo", "camicie streetwear uomo", "camicia camouflage uomo", "camicia oversize uomo streetwear"],
}

const BERMUDA_SEO: CategorySeo = {
  primaryKeyword: "bermuda streetwear uomo",
  title: "Bermuda streetwear uomo e shorts oversize",
  description:
    "Bermuda streetwear uomo, shorts oversize e pantaloni urban selezionati da MIRAI. Scopri modelli e vestibilità online.",
  heading: "Bermuda streetwear uomo: proporzioni e comfort",
  intro:
    "Bermuda e shorts streetwear lavorano sulle proporzioni: gamba ampia, lunghezze rilassate e materiali pratici creano una base equilibrata per tee oversize, camicie e sneaker.",
  details: [
    {
      title: "Volume bilanciato",
      text: "Una parte inferiore ampia può essere abbinata a una boxy tee oppure a uno strato superiore più lungo, mantenendo chiari i volumi.",
    },
    {
      title: "Dal giorno alla sera",
      text: "Colori neutri e dettagli utility rendono i bermuda oversize facili da adattare a outfit estivi diversi.",
    },
  ],
  keywords: ["bermuda streetwear uomo", "shorts streetwear uomo", "bermuda oversize uomo"],
}

const APPAREL_SEO: CategorySeo = {
  primaryKeyword: "abbigliamento urban uomo",
  title: "Abbigliamento urban uomo",
  description:
    "Abbigliamento urban uomo MIRAI: t-shirt oversize, camicie, bermuda e capi streetwear selezionati online e a Catania.",
  heading: "Abbigliamento urban uomo, costruito per esprimersi",
  intro:
    "La collezione abbigliamento MIRAI riunisce silhouette oversize, grafiche decise e capi facili da combinare. Esplora t-shirt, camicie, bermuda e nuovi drop streetwear.",
  details: [
    {
      title: "Silhouette coerenti",
      text: "Ogni categoria può dialogare con le altre attraverso proporzioni rilassate, layering e una palette urbana.",
    },
    {
      title: "Scelta consapevole",
      text: "Schede prodotto, taglie e note sul fit aiutano a scegliere online il capo più adatto al proprio stile.",
    },
  ],
  keywords: ["abbigliamento urban uomo", "abbigliamento oversize uomo", "streetwear premium online"],
}

const CATEGORY_SEO_MAP: Record<string, CategorySeo> = {
  "t-shirt": TSHIRT_SEO,
  "t-shirts": TSHIRT_SEO,
  tshirt: TSHIRT_SEO,
  magliette: TSHIRT_SEO,
  cappelli: HATS_SEO,
  headwear: HATS_SEO,
  caps: HATS_SEO,
  hats: HATS_SEO,
  camicie: SHIRTS_SEO,
  shirts: SHIRTS_SEO,
  pantaloni: BERMUDA_SEO,
  bermuda: BERMUDA_SEO,
  shorts: BERMUDA_SEO,
  abbigliamento: APPAREL_SEO,
}

export function getCategorySeo(slug: string) {
  return CATEGORY_SEO_MAP[slug.toLowerCase()]
}

export function createBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  }
}

export function createWebPageJsonLd({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage"
  name: string
  description: string
  path: string
}) {
  const url = getAbsoluteUrl(path)
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "it-IT",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  }
}
