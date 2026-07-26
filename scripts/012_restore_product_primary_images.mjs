import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xbendkxwuaqrxsyrmgye.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APPLY = process.argv.includes("--apply")

if (!SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante")
}

const catalogSource = fs.readFileSync(
  path.join(process.cwd(), "lib", "mirai-supplier-catalog.ts"),
  "utf8",
)
const catalogPrimaryBySku = new Map()
const catalogProductPattern =
  /"image_url":\s*"([^"]+)"[\s\S]*?"supplier_sku":\s*"([^"]+)"/g

for (const match of catalogSource.matchAll(catalogProductPattern)) {
  catalogPrimaryBySku.set(match[2], match[1])
}

const legacyPrimaryByProductId = new Map([
  ["3e3acd47-bb56-495a-9ddd-f89d60d003ec", "/products/minimal-couture/m0230-bermuda-camouflage-crystal.jpg"],
  ["8e0ff625-3cbc-4ad8-8470-5c66c9b8ecf9", "/products/minimal-couture/m0254-bermuda-applicazioni-blu.jpeg"],
  ["4df18da9-5321-4368-b49a-0455dc566e34", "/products/minimal-couture/m0255-bermuda-strass-blu.jpeg"],
  ["95e77b7a-90b6-4b12-9b03-63f0f97cf286", "/products/minimal-couture/m0255-bermuda-strass-marrone.jpeg"],
  ["b192c58e-e27f-4721-98ec-86959ea7eac1", "/products/minimal-couture/m0255-bermuda-strass-nero.jpeg"],
  ["93638035-fc17-4d46-b4a0-c4129cd54d42", "/products/minimal-couture/m0090-bermuda-denim-perle-front.jpeg"],
  ["2f1ae414-2e5c-45e4-8db9-67034e173be5", "/products/minimal-couture/m0254-bermuda-strass-laterali-black.jpg"],
  ["8d73cad5-9430-4fcf-be71-be9f6afeffe5", "/products/minimal-couture/m0089-camicia-denim-perle-front.jpeg"],
  ["1b97e5e9-50b6-4fff-9bfc-d812baca722c", "/products/minimal-couture/m0236-camicia-camouflage-crystal.jpg"],
  ["824c2ce3-95d1-4e52-8455-f681379c4071", "/products/minimal-couture/m0267-canotta-crown-verde.jpeg"],
  ["8f21753c-398d-476e-9368-e073757ae61b", "/products/minimal-couture/m0268-canotta-eagle-bordeaux.jpeg"],
  ["ce52d2c3-1af9-41cd-a5f0-8ffba58346d3", "/products/minimal-couture/m0259-tshirt-croci-color-black.jpg"],
  ["8b048175-c7be-4453-be13-8af904aca0bb", "/products/minimal-couture/m0259-tshirt-croci-panna-front.jpeg"],
  ["17973586-ba02-4ccf-8c2a-342ce8fdf185", "/products/minimal-couture/m0273-tshirt-croce-panna.jpeg"],
  ["ada8b320-be31-426c-b47f-91c74951e23e", "/products/minimal-couture/m0095-tshirt-madonna-viola-front.jpeg"],
])

function normalizeGalleryItem(item, productName) {
  if (typeof item === "string") {
    return { src: item, alt: productName, fit: "cover", position: "center" }
  }

  return {
    src: item.src,
    alt: item.alt || productName,
    fit: item.fit || "cover",
    position: item.position || "center",
  }
}

function representativeImages(items, limit) {
  if (items.length <= limit) return items

  const selected = []
  for (let index = 0; index < limit; index += 1) {
    const sourceIndex = Math.round((index * (items.length - 1)) / (limit - 1))
    selected.push(items[sourceIndex])
  }
  return selected
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const { data: products, error } = await supabase
  .from("products")
  .select("id, name, supplier_sku, image_url, image_gallery")

if (error) throw error

const updates = []

for (const product of products || []) {
  const originalPrimary =
    legacyPrimaryByProductId.get(product.id) ||
    catalogPrimaryBySku.get(product.supplier_sku)

  if (!originalPrimary || !product.image_url || product.image_url === originalPrimary) {
    continue
  }

  const galleryCandidates = [
    product.image_url,
    ...(Array.isArray(product.image_gallery) ? product.image_gallery : []),
  ]
    .map((item) => normalizeGalleryItem(item, product.name))
    .filter((item) => item.src && item.src !== originalPrimary)

  const deduplicated = [
    ...new Map(galleryCandidates.map((item) => [item.src, item])).values(),
  ]
  const additionalImages = representativeImages(deduplicated, 5)
  const imageGallery = [
    {
      src: originalPrimary,
      alt: `${product.name} - immagine principale`,
      fit: "cover",
      position: "center",
    },
    ...additionalImages,
  ]

  updates.push({
    id: product.id,
    name: product.name,
    previousPrimary: product.image_url,
    image_url: originalPrimary,
    image_gallery: imageGallery,
  })
}

console.table(
  updates.map(({ id, name, image_gallery }) => ({
    id,
    name,
    gallery: image_gallery.length,
  })),
)

if (!APPLY) {
  console.log(`Anteprima: ${updates.length} prodotti. Usa --apply per aggiornare Supabase.`)
  process.exit(0)
}

for (const product of updates) {
  const { error: updateError } = await supabase
    .from("products")
    .update({
      image_url: product.image_url,
      image_gallery: product.image_gallery,
      updated_at: new Date().toISOString(),
    })
    .eq("id", product.id)

  if (updateError) {
    throw new Error(`${product.name}: ${updateError.message}`)
  }
}

console.log(`Aggiornati ${updates.length} prodotti: copertina originale e gallery rappresentativa.`)
