import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const SUPABASE_URL = "https://xbendkxwuaqrxsyrmgye.supabase.co"
const UPDATE_TOKEN = "mirai-santa-madre-42c8e1"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (request.headers.get("x-mirai-update-token") !== UPDATE_TOKEN) {
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
  const { data, error } = await supabase
    .from("products")
    .update({
      brand: "Minimal",
      supplier_profile: "minimal",
      shipping_min_days: null,
      shipping_max_days: null,
      updated_at: new Date().toISOString(),
    })
    .eq("supplier_sku", "MIRAI-SANTA-MADRE-033")
    .select("id, supplier_sku, brand, supplier_profile, shipping_min_days, shipping_max_days")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: data })
}
