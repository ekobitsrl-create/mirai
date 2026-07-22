import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
  const { data, error } = await supabase
    .from("products")
    .update({
      in_stock: true,
      stock_by_size: { OS: 10 },
    })
    .like("supplier_sku", "MIRAI-%")
    .select("id, supplier_sku, in_stock, stock_by_size")

  if (error) return response({ ok: false, error: error.message }, 500)

  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
  revalidatePath("/prodotto/[id]", "page")
  revalidatePath("/google-merchant-feed.xml")
  revalidatePath("/google-merchant-feed-mirai.xml")
  revalidatePath("/sitemap.xml")

  return response({
    ok: true,
    updated: data?.length || 0,
    allAvailable: (data || []).every((product) => product.in_stock === true),
    allStockTen: (data || []).every((product) => product.stock_by_size?.OS === 10),
  })
}
