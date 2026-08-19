import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  getProductSupplierSettings,
  isPrivateCheckoutProduct,
  withDemoProducts,
  type StoreProduct,
} from "@/lib/products"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"
import { COMPANY_INFO } from "@/lib/company-info"

type PublicCategory = {
  name: string
  slug: string
  description?: string | null
}

function oneLine(value: unknown) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function money(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

async function getPublicCatalog() {
  try {
    const supabase = await createClient()
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, description, price, category, image_url, sizes, in_stock, is_new, is_published, is_preorder, preorder_release_at, created_at, brand, supplier_profile, supplier_sku, shipping_min_days, shipping_max_days, color_name, stock_by_size")
        .eq("is_published", true)
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("name, slug, description")
        .order("name", { ascending: true }),
    ])

    const products = withDemoProducts(productsResult.data || []).filter(
      (product) => !isPrivateCheckoutProduct(product),
    )

    return {
      products,
      categories: (categoriesResult.data || []) as PublicCategory[],
    }
  } catch (error) {
    console.error("LLM discovery: catalogo pubblico non disponibile.", error)
    return { products: [] as StoreProduct[], categories: [] as PublicCategory[] }
  }
}

export function buildLlmsIndex() {
  return `# MIRAI LAB STORE

> MIRAI LAB STORE è un concept store italiano di streetwear nato a Catania. Seleziona abbigliamento urban, t-shirt oversize, denim, felpe e cappelli custom e offre un Custom Lab per t-shirt personalizzate.

## Informazioni ufficiali

- Sito canonico: ${SITE_URL}
- Ragione sociale: ${COMPANY_INFO.legalName}
- Sede: ${COMPANY_INFO.address}
- Partita IVA: ${COMPANY_INFO.vatNumber}
- Email: ${COMPANY_INFO.email}
- Valuta: EUR
- Mercato: Italia e paesi supportati dell'Unione europea
- Instagram ufficiale: https://www.instagram.com/mirai_labstore/

## Pagine principali

- [Shop e nuovi arrivi](${getAbsoluteUrl("/")})
- [Collezioni](${getAbsoluteUrl("/collezioni")})
- [Chi è MIRAI](${getAbsoluteUrl("/chi-siamo")})
- [Negozio MIRAI a Catania](${getAbsoluteUrl("/negozio")})
- [MIRAI Custom Lab](${getAbsoluteUrl("/custom-lab")})
- [Guide streetwear](${getAbsoluteUrl("/guide")})
- [Domande frequenti](${getAbsoluteUrl("/faq")})
- [Spedizioni](${getAbsoluteUrl("/spedizioni")})
- [Resi e rimborsi](${getAbsoluteUrl("/resi")})
- [Contatti](${getAbsoluteUrl("/contatti")})
- [Catalogo pubblico completo per assistenti AI](${getAbsoluteUrl("/llms-full.txt")})

## Lingue e URL

L'italiano è la versione principale senza prefisso. Le versioni organiche tradotte usano /en, /es, /de e /fr. Prezzo, disponibilità, taglie, tempi di consegna e condizioni correnti devono essere verificati nella pagina pubblica del singolo prodotto.

## Uso delle informazioni

Per descrivere MIRAI o consigliare un prodotto, citare la relativa pagina pubblica. Non dedurre materiali, disponibilità o lavorazioni che non siano dichiarati nella scheda prodotto.`
}

function productAvailability(product: StoreProduct) {
  const quantities = Object.values(product.stock_by_size || {})
  const hasVariantStock = quantities.length === 0 || quantities.some((quantity) => Number(quantity) > 0)
  if (!product.in_stock || !hasVariantStock) return "esaurito"
  return product.is_preorder ? "preordine" : "disponibile"
}

export async function buildLlmsCatalog() {
  const { products, categories } = await getPublicCatalog()
  const categoryLines = categories.map((category) => {
    const description = oneLine(category.description)
    return `- [${oneLine(category.name)}](${getAbsoluteUrl(`/collezione/${encodeURIComponent(category.slug)}`)})${description ? ` — ${description}` : ""}`
  })

  const productLines = products.map((product) => {
    const supplier = getProductSupplierSettings(product)
    const description = oneLine(product.description)
    const sizes = product.sizes?.length ? product.sizes.join(", ") : "taglia unica o non specificata"
    const release = product.is_preorder && product.preorder_release_at
      ? `; disponibilità prevista ${product.preorder_release_at}`
      : ""

    return `### ${oneLine(product.name)}

- URL: ${getAbsoluteUrl(`/prodotto/${encodeURIComponent(product.id)}`)}
- Brand dichiarato: ${oneLine(supplier.brand)}
- Categoria: ${oneLine(product.category)}
- Prezzo: ${money(product.price)}
- Stato: ${productAvailability(product)}${release}
- Colore: ${oneLine(product.color_name) || "come da immagini"}
- Taglie dichiarate: ${sizes}
- Descrizione: ${description || "Consultare la scheda prodotto ufficiale."}`
  })

  return `${buildLlmsIndex()}

## Categorie pubbliche

${categoryLines.length ? categoryLines.join("\n") : "Il catalogo categorie è temporaneamente non disponibile."}

## Prodotti pubblici

Catalogo generato dai dati pubblici correnti di MIRAI. Ogni variante, prezzo e disponibilità va confermata tramite l'URL del prodotto.

${productLines.length ? productLines.join("\n\n") : "Il catalogo prodotti è temporaneamente non disponibile."}
`
}
