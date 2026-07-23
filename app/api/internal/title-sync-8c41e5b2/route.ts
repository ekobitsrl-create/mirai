import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { getPremiumProductTitle } from "@/lib/product-titles"

const SUPABASE_URL = "https://xbendkxwuaqrxsyrmgye.supabase.co"
const SYNC_TOKEN = "mirai-title-sync-20260723-6f2d0a9c"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (request.headers.get("x-mirai-title-sync-token") !== SYNC_TOKEN) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY non configurata" },
      { status: 503 },
    )
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: products, error: selectError } = await supabase
    .from("products")
    .select("id, name, category, color_name")

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 })
  }

  const updates = (products || [])
    .map((product) => ({
      id: product.id,
      previousName: product.name,
      name: getPremiumProductTitle(product),
    }))
    .filter((product) => product.name !== product.previousName)

  const results = await Promise.all(
    updates.map((product) =>
      supabase
        .from("products")
        .update({
          name: product.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id),
    ),
  )
  const failedUpdate = results.find((result) => result.error)
  if (failedUpdate?.error) {
    return NextResponse.json({ error: failedUpdate.error.message }, { status: 500 })
  }

  return NextResponse.json({
    updated: updates.length,
    total: products?.length || 0,
  })
}
