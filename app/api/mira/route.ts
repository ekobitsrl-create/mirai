import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEMO_PRODUCTS, isPrivateCheckoutProduct, withDemoProducts, type StoreProduct } from "@/lib/products"
import { formatShippingPrice, SHIPPING_CONFIG } from "@/lib/shipping"

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

type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalForMira = globalThis as typeof globalThis & {
  miraRateLimits?: Map<string, RateLimitEntry>
}

const rateLimits = globalForMira.miraRateLimits ?? new Map<string, RateLimitEntry>()
globalForMira.miraRateLimits = rateLimits

function isRateLimited(identifier: string) {
  const now = Date.now()
  const current = rateLimits.get(identifier)

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + 60_000 })
    return false
  }

  current.count += 1
  return current.count > 12
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
      .select("id, name, description, price, category, image_url, sizes, in_stock, is_new, created_at")
      .order("created_at", { ascending: false })
      .limit(40)

    return withDemoProducts((data || []) as StoreProduct[]).filter((product) => !isPrivateCheckoutProduct(product))
  } catch {
    return DEMO_PRODUCTS.filter((product) => !isPrivateCheckoutProduct(product))
  }
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

function getSuggestion(message: string, products: StoreProduct[]) {
  const normalized = normalize(message)

  if (/sped|consegna|corriere|tracking/.test(normalized)) {
    return { href: "/spedizioni", label: "Dettagli spedizioni" }
  }
  if (/reso|rimbor/.test(normalized)) {
    return { href: "/resi", label: "Come fare un reso" }
  }
  if (/pagament|paypal|klarna|carta|apple pay|google pay/.test(normalized)) {
    return { href: "/faq", label: "FAQ pagamenti" }
  }
  if (/custom|personalizz|stampa|grafica/.test(normalized)) {
    return { href: "/custom-lab#editor", label: "Apri il Custom Lab" }
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
      label: `Guarda ${matchedProduct.name}`,
    }
  }

  if (/shop|prodot|capo|magli|t-shirt|felpa|pantalon|cappell|tagli|fit|misur/.test(normalized)) {
    return { href: "/collezioni#shop-search", label: "Cerca nello shop" }
  }

  return undefined
}

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
  if (isRateLimited(identifier)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 })
  }

  const candidate = body as { message?: unknown; pathname?: unknown; history?: unknown }
  const message = typeof candidate.message === "string" ? candidate.message.trim().slice(0, 500) : ""
  const pathname = typeof candidate.pathname === "string" ? candidate.pathname.slice(0, 180) : "/"
  const history = sanitizeHistory(candidate.history)

  if (!message) {
    return NextResponse.json({ error: "Scrivi una richiesta per MIRA." }, { status: 400 })
  }

  const products = await getCatalog()
  const systemPrompt = `Sei MIRA, la guida digitale di MIRAI LAB STORE, un negozio streetwear italiano.

STILE:
- Rispondi sempre in italiano, in modo amichevole, sicuro e conciso.
- Puoi usare ogni tanto "Yo" o "Bro", senza forzare lo slang.
- Non usare la parola "drop".
- Massimo 2-3 frasi e circa 60 parole.

REGOLE:
- Usa solo le informazioni fornite qui sotto per prezzi, taglie, disponibilita, pagamenti, spedizioni e resi.
- Se non conosci un dato, dillo chiaramente e indirizza a info@mirai.store.
- Non inventare sconti, disponibilita, date o stato degli ordini.
- Non chiedere mai dati di pagamento, password o informazioni sensibili.
- Suggerisci al massimo uno o due prodotti pertinenti.

PAGINA ATTUALE: ${pathname}

INFORMAZIONI NEGOZIO:
- Spedizione standard gratuita, senza importo minimo: ${SHIPPING_CONFIG.standardDeliveryDays.minimum}-${SHIPPING_CONFIG.standardDeliveryDays.maximum} giorni lavorativi.
- Spedizione express: ${formatShippingPrice(SHIPPING_CONFIG.expressPriceCents)}, ${SHIPPING_CONFIG.expressDeliveryDays.minimum}-${SHIPPING_CONFIG.expressDeliveryDays.maximum} giorni lavorativi.
- Reso richiedibile entro 14 giorni dalla consegna; rimborso entro 7 giorni lavorativi dalla verifica.
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
      ...getSuggestion(message, products),
    })
  } catch (error) {
    console.error("[MIRA] OpenAI connection failed:", error)
    return NextResponse.json({ error: "MIRA non riesce a collegarsi in questo momento." }, { status: 502 })
  }
}
