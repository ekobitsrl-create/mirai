import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isPrivateCheckoutProduct, withDemoProducts, type StoreProduct } from "@/lib/products"
import { SHIPPING_CONFIG } from "@/lib/shipping"
import {
  consumeRateLimit,
  contentLengthWithin,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"
import type { Locale } from "@/lib/translations"

export const runtime = "nodejs"
export const maxDuration = 20

type MiraTurn = {
  role: "user" | "assistant"
  content: string
}

type OpenAIResponse = {
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
  error?: {
    message?: string
  }
}

function sanitizeHistory(value: unknown): MiraTurn[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((turn): turn is MiraTurn => {
      if (!turn || typeof turn !== "object") return false
      const candidate = turn as Partial<MiraTurn>
      return (candidate.role === "user" || candidate.role === "assistant")
        && typeof candidate.content === "string"
        && candidate.content.trim().length > 0
    })
    .slice(-6)
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim().slice(0, 500),
    }))
}

async function getCatalog() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("products")
      .select("id, name, description, price, category, image_url, sizes, in_stock, is_new, created_at, fit_note, color_name, care")
      .order("created_at", { ascending: false })
      .limit(40)

    return withDemoProducts((data || []) as StoreProduct[]).filter((product) => !isPrivateCheckoutProduct(product))
  } catch {
    return []
  }
}

// Lightweight catalog endpoint consumed client-side by the MIRA guide widget to
// power its offline fallback answers (product names, sizes, fit, care, colors).
export async function GET() {
  const products = await getCatalog()
  return NextResponse.json(
    {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        image_url: product.image_url,
        sizes: product.sizes || [],
        in_stock: Boolean(product.in_stock),
        is_new: Boolean(product.is_new),
        created_at: product.created_at,
        fit_note: product.fit_note,
        color_name: product.color_name,
        care: product.care,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  )
}

function catalogForPrompt(products: StoreProduct[]) {
  return products.map((product) => ({
    name: product.name,
    category: product.category,
    price_eur: Number(product.price),
    sizes: product.sizes || [],
    available: Boolean(product.in_stock),
    description: product.description || "",
  }))
}

function extractText(response: OpenAIResponse) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim()
  }

  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim()
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
}

function getSuggestion(message: string, products: StoreProduct[], locale: Locale) {
  const normalized = normalize(message)
  const labels = {
    it: { shipping: "Dettagli spedizioni", returns: "Come fare un reso", payments: "FAQ pagamenti", custom: "Apri il Custom Lab", search: "Cerca nello shop", view: "Guarda" },
    en: { shipping: "Shipping details", returns: "How to make a return", payments: "Payment FAQ", custom: "Open Custom Lab", search: "Search the shop", view: "View" },
    es: { shipping: "Detalles del envío", returns: "Cómo realizar una devolución", payments: "Preguntas sobre pagos", custom: "Abrir Custom Lab", search: "Buscar en la tienda", view: "Ver" },
    de: { shipping: "Versanddetails", returns: "Rückgabe durchführen", payments: "FAQ zur Zahlung", custom: "Custom Lab öffnen", search: "Im Shop suchen", view: "Ansehen" },
    fr: { shipping: "Détails de livraison", returns: "Effectuer un retour", payments: "FAQ sur le paiement", custom: "Ouvrir le Custom Lab", search: "Rechercher dans la boutique", view: "Voir" },
  }[locale]

  if (/sped|consegna|corriere|tracking/.test(normalized)) {
    return { href: "/spedizioni", label: labels.shipping }
  }
  if (/reso|rimbor/.test(normalized)) {
    return { href: "/resi", label: labels.returns }
  }
  if (/pagament|paypal|klarna|carta|apple pay|google pay/.test(normalized)) {
    return { href: "/faq", label: labels.payments }
  }
  if (/custom|personalizz|stampa|grafica/.test(normalized)) {
    return { href: "/custom-lab#editor", label: labels.custom }
  }

  const availableProducts = products.filter((product) => product.in_stock)
  const matchedProduct = availableProducts.find((product) => {
    const name = normalize(product.name)
    const category = normalize(product.category)
    const meaningfulNameWords = name.split(/\s+/).filter((word) => word.length >= 4)
    return normalized.includes(name)
      || (category.length >= 4 && normalized.includes(category))
      || meaningfulNameWords.some((word) => normalized.includes(word))
  })

  if (matchedProduct) {
    return {
      href: `/prodotto/${matchedProduct.id}`,
      label: `${labels.view} ${matchedProduct.name}`,
    }
  }

  if (/shop|prodot|capo|magli|t-shirt|felpa|pantalon|cappell|tagli|fit|misur/.test(normalized)) {
    return { href: "/collezioni#shop-search", label: labels.search }
  }

  return undefined
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine non valida." }, { status: 403 })
  }
  if (!contentLengthWithin(request, 32 * 1024)) {
    return NextResponse.json({ error: "Richiesta troppo grande." }, { status: 413 })
  }
  if (!await consumeRateLimit({ bucket: "mira", limit: 12, windowSeconds: 60, request })) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false }, { status: 503 })
  }

  let body: unknown
  try {
    body = await readJsonBody(request, 32 * 1024)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Richiesta troppo grande." }, { status: 413 })
    }
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 })
  }

  const candidate = body as { message?: unknown; pathname?: unknown; history?: unknown; locale?: unknown }
  const message = typeof candidate.message === "string" ? candidate.message.trim().slice(0, 500) : ""
  const pathname = typeof candidate.pathname === "string" ? candidate.pathname.slice(0, 180) : "/"
  const history = sanitizeHistory(candidate.history)
  const locale: Locale = ["it", "en", "es", "de", "fr"].includes(String(candidate.locale))
    ? candidate.locale as Locale
    : "it"
  const responseLanguages: Record<Locale, string> = {
    it: "italiano",
    en: "inglese",
    es: "spagnolo",
    de: "tedesco",
    fr: "francese",
  }

  if (!message) {
    return NextResponse.json({ error: "Scrivi una richiesta per MIRA." }, { status: 400 })
  }

  const products = await getCatalog()
  const systemPrompt = `Sei MIRA, la guida digitale di MIRAI LAB STORE, un negozio streetwear italiano.

STILE:
- Rispondi sempre in ${responseLanguages[locale]}, la lingua selezionata dall'utente, in modo amichevole, sicuro e conciso.
- Puoi usare ogni tanto "Yo" o "Bro", senza forzare lo slang.
- Non usare la parola "drop".
- Massimo 2-3 frasi e circa 60 parole.

REGOLE:
- Usa solo le informazioni fornite qui sotto per prezzi, taglie, disponibilita, pagamenti, spedizioni e resi.
- Se non conosci un dato, dillo chiaramente e indirizza a info@mirailabstore.com.
- Non inventare sconti, disponibilita, date o stato degli ordini.
- Non chiedere mai dati di pagamento, password o informazioni sensibili.
- Suggerisci al massimo uno o due prodotti pertinenti.

PAGINA ATTUALE: ${pathname}

INFORMAZIONI NEGOZIO:
- Spedizione standard gratuita, senza importo minimo: ${SHIPPING_CONFIG.standardDeliveryDays.minimum}-${SHIPPING_CONFIG.standardDeliveryDays.maximum} giorni lavorativi.
- Contrassegno disponibile per consegne in Italia.
- Per gli ordini consegnati in Italia, reso gratuito richiedibile entro 14 giorni di calendario dalla consegna. MIRAI invia l'etichetta prepagata, sostiene le spese di restituzione e non applica costi di restocking. Rimborso emesso entro 14 giorni dalla ricezione e verifica.
- Pagamenti gestiti tramite Stripe. I metodi effettivamente mostrati al checkout dipendono dalla configurazione attiva.
- Custom Lab online: T-shirt heavyweight oversize personalizzabile con colore, taglia, stampa fronte o retro, testo o grafica. Prezzo 79 euro con una stampa inclusa. I prodotti personalizzati non sono restituibili salvo difetti.

CATALOGO ATTUALE:
${JSON.stringify(catalogForPrompt(products))}`

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MIRA_MODEL || "gpt-5-mini",
        instructions: systemPrompt,
        input: [...history, { role: "user", content: message }],
        max_output_tokens: 220,
        store: false,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    const payload = await openAIResponse.json() as OpenAIResponse
    if (!openAIResponse.ok) {
      console.error("[MIRA] OpenAI request failed:", openAIResponse.status, payload.error?.message)
      return NextResponse.json({ error: "MIRA non riesce a rispondere in questo momento." }, { status: 502 })
    }

    const reply = extractText(payload)
    if (!reply) {
      return NextResponse.json({ error: "MIRA non ha prodotto una risposta." }, { status: 502 })
    }

    return NextResponse.json({
      configured: true,
      reply,
      ...getSuggestion(message, products, locale),
    })
  } catch (error) {
    console.error("[MIRA] OpenAI connection failed:", error)
    return NextResponse.json({ error: "MIRA non riesce a collegarsi in questo momento." }, { status: 502 })
  }
}
