import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xbendkxwuaqrxsyrmgye.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const PRODUCT_IDS = [
  "4c89683d-939d-427a-8a34-3e00f9509d1e",
  "dc89f425-f02a-44e6-9694-b8131baed774",
  "835cb227-c4f9-48db-88a2-d8a0ac021c66",
  "d7304772-f3df-4ad3-84b0-b2039f9812a1",
  "b7629ec4-34d2-428b-b0d8-ccfd9317de99",
]

const HAS_INCORRECT_CLAIM = /Pezzo unico fatto a mano/i
const INCORRECT_CLAIM = /\s*Pezzo unico fatto a mano\.?\s*/gi
const REPLACEMENT =
  " Personalizzazione con applicazioni decorative e finitura premium, disponibile nelle taglie indicate."

if (!SERVICE_ROLE_KEY) {
  console.log("[descrizioni cappelli] Aggiornamento database saltato: credenziali server non disponibili.")
  process.exit(0)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: products, error: readError } = await supabase
  .from("products")
  .select("id, description, sizes")
  .in("id", PRODUCT_IDS)

if (readError) {
  throw new Error(`[descrizioni cappelli] Lettura fallita: ${readError.message}`)
}

const productsToUpdate = (products || []).filter(
  (product) =>
    Array.isArray(product.sizes) &&
    product.sizes.length > 1 &&
    typeof product.description === "string" &&
    HAS_INCORRECT_CLAIM.test(product.description),
)

for (const product of productsToUpdate) {
  const description = product.description.replace(INCORRECT_CLAIM, REPLACEMENT).trim()
  const { error: updateError } = await supabase
    .from("products")
    .update({ description })
    .eq("id", product.id)

  if (updateError) {
    throw new Error(`[descrizioni cappelli] Aggiornamento ${product.id} fallito: ${updateError.message}`)
  }
}

console.log(`[descrizioni cappelli] Prodotti aggiornati: ${productsToUpdate.length}.`)
