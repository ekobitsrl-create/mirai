import { type StoreProduct } from "@/lib/products"
import { formatShippingPrice, SHIPPING_CONFIG } from "@/lib/shipping"

export type MiraIntent =
  | "greeting"
  | "thanks"
  | "goodbye"
  | "identity"
  | "capabilities"
  | "brand"
  | "product"
  | "budget"
  | "size"
  | "fit"
  | "stock"
  | "care"
  | "colors"
  | "shipping"
  | "tracking"
  | "returns"
  | "refund"
  | "payments"
  | "discount"
  | "order"
  | "account"
  | "customization"
  | "store"
  | "contact"
  | "sustainability"
  | "compliment"
  | "unknown"

export type MiraKnowledgeContext = {
  pathname?: string
  lastIntent?: MiraIntent | null
  lastProductId?: string | null
}

export type MiraKnowledgeReply = {
  text: string
  intent: MiraIntent
  href?: string
  label?: string
  productId?: string
}

const EXPRESS_PRICE = formatShippingPrice(SHIPPING_CONFIG.expressPriceCents)

// The offline fallback catalog is populated at runtime from the database
// (see setMiraCatalog, called client-side by the MIRA guide widget). When the
// live /api/mira endpoint answers, product data comes from the DB catalog instead.
let miraCatalog: StoreProduct[] = []

export function setMiraCatalog(products: StoreProduct[]) {
  miraCatalog = products
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-zA-Z0-9€+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("it-IT")
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = row[0]
    row[0] = leftIndex
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const stored = row[rightIndex]
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        previous + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      )
      previous = stored
    }
  }
  return row[right.length]
}

function includesTerm(message: string, term: string) {
  const normalizedTerm = normalize(term)
  if (message.includes(normalizedTerm)) return true
  if (normalizedTerm.includes(" ") || normalizedTerm.length < 5) return false

  const tolerance = normalizedTerm.length >= 8 ? 2 : 1
  return message
    .split(" ")
    .filter((word) => Math.abs(word.length - normalizedTerm.length) <= tolerance)
    .some((word) => editDistance(word, normalizedTerm) <= tolerance)
}

function hasAny(message: string, terms: string[]) {
  return terms.some((term) => includesTerm(message, term))
}

function pick(seed: string, options: string[]) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return options[hash % options.length]
}

function answer(
  intent: MiraIntent,
  text: string,
  href?: string,
  label?: string,
  productId?: string,
): MiraKnowledgeReply {
  return { intent, text, href, label, productId }
}

function productFromContext(message: string, context: MiraKnowledgeContext) {
  const productIdFromPath = context.pathname?.match(/^\/prodotto\/([^/?#]+)/)?.[1]
  const contextualId = productIdFromPath || context.lastProductId

  return miraCatalog.find((product) => {
    const productName = normalize(product.name)
    const words = productName.split(" ").filter((word) => word.length >= 4)
    return product.id === contextualId
      || message.includes(productName)
      || words.some((word) => message.includes(word))
  })
}

function productReply(product: StoreProduct) {
  const price = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(product.price))
  const availability = product.in_stock ? "disponibile" : "momentaneamente non disponibile"
  const sizes = product.sizes?.length ? ` Taglie: ${product.sizes.join(", ")}.` : ""

  return answer(
    "product",
    `${product.name}: ${product.description || product.category}. Costa ${price} ed è ${availability}.${sizes}`,
    `/prodotto/${product.id}`,
    `Guarda ${product.name}`,
    product.id,
  )
}

function budgetReply(message: string) {
  const budgetMatch = message.match(/(?:budget|massimo|max|entro|ho|spendere|sotto)\s*(?:di\s*)?(\d{1,4})|(?:€\s*|euro\s*)(\d{1,4})|(\d{1,4})\s*(?:€|euro)/)
  const budget = Number(budgetMatch?.[1] || budgetMatch?.[2] || budgetMatch?.[3] || 0)

  if (!budget) {
    return answer(
      "budget",
      "Dimmi quanto vuoi spendere e che tipo di capo cerchi: provo a restringere subito la scelta.",
      "/collezioni#shop-search",
      "Esplora lo shop",
    )
  }

  const matching = miraCatalog
    .filter((product) => product.in_stock && Number(product.price) <= budget)
    .sort((left, right) => Number(right.price) - Number(left.price))

  if (!matching.length) {
    return answer(
      "budget",
      `Con un budget di ${budget} € al momento non vedo un capo disponibile nel catalogo che posso consigliarti con certezza. Controlla lo shop: i prodotti vengono aggiornati lì.`,
      "/collezioni#shop-search",
      "Controlla lo shop",
    )
  }

  const product = matching[0]
  return answer(
    "budget",
    `Con ${budget} € ci sta ${product.name} a ${Number(product.price).toFixed(0)} €. È ${product.in_stock ? "disponibile" : "non disponibile"} nelle taglie ${product.sizes.join(", ")}.`,
    `/prodotto/${product.id}`,
    `Guarda ${product.name}`,
    product.id,
  )
}

function contextualFollowUp(message: string, context: MiraKnowledgeContext) {
  const isShortFollowUp = message.split(" ").length <= 7
    && hasAny(message, ["e invece", "quanto costa", "quanto tempo", "come funziona", "e gratis", "dove", "quando", "quali", "perche"])

  if (!isShortFollowUp || !context.lastIntent) return null

  if (context.lastIntent === "shipping" || context.lastIntent === "tracking") {
    if (hasAny(message, ["costa", "prezzo", "gratis", "gratuita", "express"])) {
      return answer("shipping", `La standard è gratuita. L’express costa ${EXPRESS_PRICE}.`, "/spedizioni", "Dettagli spedizioni")
    }
    return answer("shipping", "La standard richiede 3–5 giorni lavorativi; l’express 1–2. Il tracking arriva via email dopo la spedizione.", "/spedizioni", "Dettagli spedizioni")
  }

  if (context.lastIntent === "returns" || context.lastIntent === "refund") {
    if (hasAny(message, ["gratis", "gratuito", "costa"])) {
      return answer("returns", "Per gli ordini spediti in Italia il reso è gratuito. Per i resi internazionali il costo può variare.", "/resi", "Dettagli reso")
    }
    return answer("refund", "Dopo la ricezione e la verifica del reso, il rimborso viene elaborato entro 7 giorni lavorativi sul metodo di pagamento originale.", "/resi", "Dettagli rimborso")
  }

  if (context.lastIntent === "customization") {
    return answer("customization", "Nel Custom Lab puoi scegliere colore, taglia, fronte o retro e aggiungere testo o una grafica. La Custom Heavy Tee parte da 79 €; i prodotti personalizzati non sono restituibili salvo difetti.", "/custom-lab#editor", "Apri il Custom Lab")
  }

  if (["product", "size", "fit", "stock", "care", "colors", "budget"].includes(context.lastIntent)) {
    const product = productFromContext(message, context)
    if (product) return productReply(product)
  }

  return null
}

export function getMiraLocalReply(rawMessage: string, context: MiraKnowledgeContext = {}): MiraKnowledgeReply {
  const message = normalize(rawMessage)

  if (!message) {
    return answer("unknown", "Dimmi pure: posso aiutarti con capi, taglie, ordini, spedizioni, resi e pagamenti.")
  }

  const asksShipping = hasAny(message, ["spedizione", "spedire", "consegna", "corriere", "express", "estero"])
  const asksReturns = hasAny(message, ["reso", "restituire", "restituzione", "rimandare indietro", "rimborso"])
  const asksPayments = hasAny(message, ["pagamento", "pagare", "paypal", "klarna", "scalapay", "visa", "mastercard", "postepay", "carta", "apple pay", "google pay", "stripe"])

  if (asksShipping && asksReturns) {
    return answer(
      "shipping",
      "La spedizione standard è gratuita e richiede 3–5 giorni lavorativi. Se il capo non va bene, puoi chiedere il reso entro 14 giorni; in Italia il reso è gratuito.",
      "/faq",
      "Vedi tutte le FAQ",
    )
  }

  if (asksShipping && asksPayments) {
    return answer(
      "shipping",
      "La spedizione standard è gratuita. Il pagamento passa da Stripe e puoi usare carta, PayPal, Apple Pay, Google Pay, Klarna e Scalapay quando disponibili al checkout.",
      "/faq",
      "FAQ acquisto",
    )
  }

  const followUp = contextualFollowUp(message, context)
  if (followUp) return followUp

  if (hasAny(message, ["ciao", "salve", "buongiorno", "buonasera", "hey", "ehi", "yo"])) {
    return answer("greeting", pick(message, [
      "Yo! Dimmi cosa stai cercando e ti porto subito nella direzione giusta.",
      "Ciao! Cerchi un capo, una taglia o informazioni su ordine e consegna?",
      "Ehi! Sono qui: raccontami cosa ti serve.",
    ]))
  }

  if (hasAny(message, ["grazie", "gentile", "perfetto", "top", "grande"])) {
    return answer("thanks", pick(message, [
      "Ci sono, Bro. Se ti viene un altro dubbio chiamami.",
      "Volentieri! Rimango qui se vuoi continuare a cercare.",
      "Sempre pronta. Dimmi pure cos’altro ti serve.",
    ]))
  }

  if (hasAny(message, ["arrivederci", "a dopo", "ci vediamo", "bye", "ciao mira"])) {
    return answer("goodbye", "A dopo! Io resto qui se serve una mano.")
  }

  if (hasAny(message, ["chi sei", "come ti chiami", "sei un bot", "sei vera", "sei umano", "cosa sei"])) {
    return answer("identity", "Sono MIRA, la guida digitale di MIRAI LAB STORE. Non sono una persona e non sostituisco l’assistenza, ma conosco il sito e posso aiutarti a orientarti.", "/chi-siamo", "Scopri MIRAI")
  }

  if (hasAny(message, ["cosa sai fare", "come puoi aiutarmi", "cosa posso chiedere", "aiutami", "serve aiuto"])) {
    return answer("capabilities", "Posso consigliarti capi in base a budget e taglia, spiegare fit e disponibilità e guidarti su ordini, pagamenti, spedizioni, resi, sconti e personalizzazioni.", "/faq", "Apri le FAQ")
  }

  if (hasAny(message, ["bella", "carina", "forte", "brava", "mi piaci", "sei figa", "sei bella"])) {
    return answer("compliment", pick(message, [
      "Apprezzo! Il viola neon aiuta parecchio.",
      "Grazie, ci tenevo ad avere una presenza bella street.",
      "Yo, così mi fai illuminare tutto il visore.",
    ]))
  }

  if (hasAny(message, ["mirai10", "codice", "coupon", "sconto", "promozione", "primo ordine"])) {
    return answer("discount", "Sul primo ordine puoi usare il codice MIRAI10 per ottenere il 10% di sconto. Inseriscilo quando il checkout mostra il campo promozionale.", "/collezioni", "Vai allo shop")
  }

  if (hasAny(message, ["annullare", "cancellare ordine", "modificare ordine", "cambiare ordine", "ordine sbagliato"])) {
    return answer("order", "Puoi chiedere modifica o annullamento entro 2 ore dall’ordine scrivendo a info@mirai.store. Se è già stato spedito, non può essere annullato ma puoi richiedere un reso.", "/contatti", "Contatta MIRAI")
  }

  if (hasAny(message, ["conferma ordine", "email ordine", "non ho ricevuto", "ricevuta", "numero ordine"])) {
    return answer("order", "Dopo l’acquisto ricevi un’email con riepilogo e numero d’ordine. Controlla anche spam e promozioni; se manca, scrivi a info@mirai.store.", "/contatti", "Contatta MIRAI")
  }

  if (hasAny(message, ["dov e il mio ordine", "dove e il mio ordine", "stato ordine", "tracciare", "tracciamento", "tracking", "pacco"])) {
    return answer("tracking", "Il codice di tracking arriva via email dopo la spedizione e può impiegare fino a 24 ore per attivarsi. Io non posso vedere i dati del tuo ordine: se serve assistenza, indica il numero d’ordine a info@mirai.store.", "/spedizioni", "Info tracking")
  }

  if (asksShipping) {
    if (hasAny(message, ["estero", "europa", "francia", "germania", "spagna", "regno unito", "svizzera", "internazionale"])) {
      return answer("shipping", "MIRAI spedisce nell’Unione Europea, nel Regno Unito e in Svizzera con le tempistiche indicate sul sito. Per altre destinazioni, chiedi conferma all’assistenza.", "/spedizioni", "Destinazioni servite")
    }
    if (hasAny(message, ["quanto costa", "costo", "prezzo", "gratis", "gratuita"])) {
      return answer("shipping", `La spedizione standard è sempre gratuita, senza minimo d’ordine. L’express costa ${EXPRESS_PRICE}.`, "/spedizioni", "Dettagli spedizioni")
    }
    return answer("shipping", `La standard è gratuita e richiede 3–5 giorni lavorativi. L’express richiede 1–2 giorni e costa ${EXPRESS_PRICE}.`, "/spedizioni", "Dettagli spedizioni")
  }

  if (hasAny(message, ["rimborso", "soldi indietro", "riavere i soldi", "accredito"])) {
    return answer("refund", "Il rimborso viene elaborato entro 7 giorni lavorativi dalla ricezione e verifica del reso, sullo stesso metodo usato per pagare.", "/resi", "Dettagli rimborso")
  }

  if (asksReturns) {
    if (hasAny(message, ["personalizzato", "custom", "lavato", "indossato", "senza etichetta"])) {
      return answer("returns", "Non sono accettati prodotti personalizzati, lavati, indossati o senza etichette originali. Se hai un caso particolare, scrivi all’assistenza prima di spedire.", "/resi", "Condizioni del reso")
    }
    return answer("returns", "Puoi richiedere il reso entro 14 giorni dalla consegna. Il capo deve essere integro, non indossato e con le etichette; per gli ordini spediti in Italia il reso è gratuito.", "/resi", "Come fare il reso")
  }

  if (asksPayments) {
    if (hasAny(message, ["sicuro", "sicurezza", "dati carta", "protezione"])) {
      return answer("payments", "I pagamenti vengono elaborati tramite Stripe: MIRAI non conserva direttamente i dati completi della carta.", "/faq", "FAQ pagamenti")
    }
    if (hasAny(message, ["klarna", "rate", "a rate", "paga dopo"])) {
      return answer("payments", "Klarna può comparire tra i pagamenti rapidi quando è abilitato e disponibile per quell’acquisto. La conferma definitiva è sempre quella mostrata al checkout.", "/faq", "FAQ pagamenti")
    }
    if (hasAny(message, ["scalapay"])) {
      return answer("payments", "Scalapay può comparire tra i pagamenti rapidi per ordini in euro idonei, quando è attivo sul tuo account Stripe. La disponibilità definitiva viene verificata nel checkout.", "/faq", "FAQ pagamenti")
    }
    return answer("payments", "Il checkout è gestito tramite Stripe. Sono previsti Visa, Mastercard, Postepay, PayPal, Apple Pay e Google Pay; Klarna e Scalapay compaiono quando disponibili e abilitati.", "/faq", "Metodi di pagamento")
  }

  if (hasAny(message, ["personalizzare", "personalizzazione", "customizzare", "custom", "stampa", "ricamo", "creare maglietta"])) {
    return answer("customization", "Puoi creare online una MIRAI Custom Heavy Tee: scegli colore, taglia, lato di stampa, testo o grafica e guarda subito l’anteprima. Costa 79 € con una stampa inclusa.", "/custom-lab#editor", "Crea la tua T-shirt")
  }

  if (hasAny(message, ["negozio", "store", "lab store", "dove siete", "indirizzo", "catania", "ritiro in negozio", "apertura"])) {
    return answer("store", "MIRAI nasce a Catania e il MIRAI LAB STORE aprirà prossimamente. Anche il ritiro in negozio sarà disponibile a breve.", "/contatti", "Info sullo store")
  }

  if (hasAny(message, ["orari", "quando rispondete", "assistenza aperta"])) {
    return answer("contact", "L’assistenza è indicata dal lunedì al venerdì, 10:00–13:00 e 15:00–18:00. Via email la risposta è prevista entro 24 ore lavorative.", "/contatti", "Contatti e orari")
  }

  if (hasAny(message, ["contatto", "contattare", "email", "telefono", "parlare con qualcuno", "operatore", "persona vera", "assistenza"])) {
    return answer("contact", "Puoi scrivere a info@mirai.store oppure usare la pagina Contatti. Per un ordine esistente includi sempre il numero d’ordine.", "/contatti", "Contatta MIRAI")
  }

  if (hasAny(message, ["account", "accedere", "login", "registrazione", "registrarmi", "password"])) {
    return answer("account", "Dalla voce Account puoi accedere o creare il tuo profilo. Se hai dimenticato la password, usa la procedura disponibile nella schermata di accesso.", "/auth/login", "Vai all’account")
  }

  if (hasAny(message, ["sostenibile", "sostenibilita", "ambiente", "riciclabile", "packaging", "confezione"])) {
    return answer("sustainability", "Gli ordini vengono preparati in packaging MIRAI con materiali riciclabili e a basso impatto ambientale, pensati per proteggere il prodotto.", "/spedizioni", "Scopri il packaging")
  }

  if (hasAny(message, ["chi e mirai", "cos e mirai", "brand", "marchio", "storia", "progetto", "nato"])) {
    return answer("brand", "MIRAI è un progetto streetwear nato a Catania che unisce moda, tecnologia e cultura urbana, con un’estetica urban-futuristica.", "/chi-siamo", "Scopri il progetto")
  }

  const product = productFromContext(message, context)

  if (hasAny(message, ["budget", "spendere", "massimo", "sotto", "entro", "euro", "€"])) {
    return budgetReply(message)
  }

  if (hasAny(message, ["taglia", "taglie", "misura", "torace", "lunghezza", "manica", "s m l", "xl"])) {
    if (product) {
      return answer("size", `${product.name} è disponibile nelle taglie ${product.sizes.join(", ")}. ${product.fit_note || "Consulta la guida nella pagina prodotto prima di scegliere."}`, `/prodotto/${product.id}`, "Apri la guida taglie", product.id)
    }
    return answer("size", "Ogni pagina prodotto contiene la guida con torace, lunghezza e manica. Quando il fit è indicato come oversize, puoi partire dalla tua taglia abituale.", "/collezioni", "Scegli un capo")
  }

  if (hasAny(message, ["fit", "vestibilita", "oversize", "largo", "stretto", "veste"])) {
    return answer("fit", product
      ? `${product.name}: ${product.fit_note || "controlla la guida alle taglie nella pagina prodotto."}`
      : "Il fit cambia in base al prodotto. Se è indicato come oversize, scegli la taglia abituale; per un effetto meno ampio valuta una taglia in meno.", product ? `/prodotto/${product.id}` : "/collezioni", product ? `Guarda ${product.name}` : "Apri lo shop", product?.id)
  }

  if (hasAny(message, ["disponibile", "disponibilita", "stock", "rimasto", "esaurito", "sold out"])) {
    if (product) {
      return answer("stock", `${product.name} risulta ${product.in_stock ? `disponibile nelle taglie ${product.sizes.join(", ")}` : "momentaneamente non disponibile"}.`, `/prodotto/${product.id}`, `Guarda ${product.name}`, product.id)
    }
    return answer("stock", "La disponibilità aggiornata è visibile sulle pagine prodotto. Dimmi il nome del capo e provo a controllare quello che conosco.", "/collezioni", "Controlla lo shop")
  }

  if (hasAny(message, ["lavare", "lavaggio", "lavatrice", "stirare", "cura", "candeggina"])) {
    if (product?.care) {
      return answer("care", `Per ${product.name}: ${product.care}`, `/prodotto/${product.id}`, "Dettagli del capo", product.id)
    }
    return answer("care", "Controlla sempre le istruzioni nella pagina del prodotto e sull’etichetta. Se mi dici il nome del capo posso darti l’indicazione disponibile sul sito.", "/collezioni", "Trova il prodotto")
  }

  if (hasAny(message, ["colore", "colori", "foto", "dal vivo", "schermo"])) {
    if (product?.color_name) {
      return answer("colors", `${product.name} è disponibile nella variante ${product.color_name}. Le foto possono variare leggermente in base a luce e schermo.`, `/prodotto/${product.id}`, `Guarda ${product.name}`, product.id)
    }
    return answer("colors", "Le foto cercano di rappresentare fedelmente i colori, ma può esserci una leggera variazione dovuta allo schermo e alla luce.", "/collezioni", "Guarda i prodotti")
  }

  if (product) return productReply(product)

  if (hasAny(message, ["maglietta", "t-shirt", "felpa", "pantalone", "cappello", "capo", "prodotto", "shop", "comprare", "consiglio"])) {
    return answer("product", "Dimmi categoria, taglia e budget e provo a restringere la scelta. Puoi anche usare ricerca e filtri nello shop.", "/collezioni#shop-search", "Cerca nello shop")
  }

  return answer(
    "unknown",
    pick(message, [
      "Non voglio inventarti una risposta. Posso aiutarti su prodotti, taglie, pagamenti, ordini, spedizioni, resi, sconti, store e personalizzazioni.",
      "Questa non l’ho capita bene. Prova a dirmi l’argomento in poche parole, per esempio: taglia, ordine, consegna, reso o pagamento.",
      "Mi manca un dettaglio per risponderti bene. Stai parlando di un prodotto, di un ordine o di una consegna?",
    ]),
    "/faq",
    "Guarda le FAQ",
  )
}
