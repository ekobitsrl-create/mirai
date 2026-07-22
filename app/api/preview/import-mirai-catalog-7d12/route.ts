import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { MIRAI_SUPPLIER_CATALOG } from "@/lib/mirai-supplier-catalog"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  })
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return response({ ok: false, error: "Route disponibile solo nel deploy preview." }, 404)
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return response({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY non configurata nel preview." }, 503)
  }

  const supabase = await createClient()
  const catalogSkus = MIRAI_SUPPLIER_CATALOG.map((product) => product.supplier_sku)
  const { data: existingProducts, error: existingError } = await supabase
    .from("products")
    .select("supplier_sku")
    .in("supplier_sku", catalogSkus)

  if (existingError) return response({ ok: false, error: existingError.message }, 500)

  const existingSkus = new Set(
    (existingProducts || [])
      .map((product) => product.supplier_sku)
      .filter((sku): sku is string => Boolean(sku)),
  )
  const missingProducts = MIRAI_SUPPLIER_CATALOG.filter(
    (product) => !existingSkus.has(product.supplier_sku),
  )

  const { data: canotteCategory, error: canotteSelectError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "canotte")
    .maybeSingle()

  if (canotteSelectError) return response({ ok: false, error: canotteSelectError.message }, 500)

  let categoryCreated = false
  if (!canotteCategory) {
    const { error: categoryInsertError } = await supabase.from("categories").insert({
      name: "Canotte",
      slug: "canotte",
      description: "Canotte e smanicati streetwear MIRAI.",
      sort_order: 35,
    })

    if (categoryInsertError) return response({ ok: false, error: categoryInsertError.message }, 500)
    categoryCreated = true
  }

  if (missingProducts.length > 0) {
    const rows = missingProducts.map((product) => ({
      ...product,
      image_gallery: product.image_gallery.map((src) => ({
        src,
        alt: product.name,
        fit: "contain",
      })),
      sizes: [...product.sizes],
      stock_by_size: { ...product.stock_by_size },
      detail_items: [...product.detail_items],
    }))
    const { error: insertError } = await supabase.from("products").insert(rows)

    if (insertError) return response({ ok: false, error: insertError.message }, 500)
  }

  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
  revalidatePath("/google-merchant-feed.xml")
  revalidatePath("/google-merchant-feed-minimal.xml")
  revalidatePath("/google-merchant-feed-mirai.xml")
  revalidatePath("/sitemap.xml")

  return response({
    ok: true,
    inserted: missingProducts.length,
    skipped: existingSkus.size,
    total: MIRAI_SUPPLIER_CATALOG.length,
    categoryCreated,
  })
}
