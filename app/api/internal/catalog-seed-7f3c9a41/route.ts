import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { MIRAI_SUPPLIER_CATALOG } from "@/lib/mirai-supplier-catalog"

const SUPABASE_URL = "https://xbendkxwuaqrxsyrmgye.supabase.co"
const IMPORT_TOKEN = "mirai-7f3c9a41-20260723"
const TARGET_SKUS = new Set([
  "MIRAI-SANTA-MADRE-033",
  "MIRAI-GENESI-I-034",
])

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (request.headers.get("x-mirai-import-token") !== IMPORT_TOKEN) {
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
  const products = MIRAI_SUPPLIER_CATALOG.filter((product) =>
    TARGET_SKUS.has(product.supplier_sku),
  )

  const categories = [
    {
      name: "Canotte",
      slug: "canotte",
      description: "Canotte e smanicati streetwear MIRAI.",
      image_url: "/images/categories/canotte.webp",
      sort_order: 35,
    },
    {
      name: "Profumi",
      slug: "profumi",
      description: "Fragranze e profumi MIRAI.",
      image_url: "/images/categories/profumi-genesi.webp",
      sort_order: 55,
    },
  ]

  for (const category of categories) {
    const { data: existing, error: selectError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category.slug)
      .maybeSingle()

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    const mutation = existing
      ? supabase.from("categories").update(category).eq("id", existing.id)
      : supabase.from("categories").insert(category)
    const { error: categoryError } = await mutation

    if (categoryError) {
      return NextResponse.json({ error: categoryError.message }, { status: 500 })
    }
  }

  const { data: existingProducts, error: existingProductsError } = await supabase
    .from("products")
    .select("supplier_sku")
    .in("supplier_sku", [...TARGET_SKUS])

  if (existingProductsError) {
    return NextResponse.json(
      { error: existingProductsError.message },
      { status: 500 },
    )
  }

  const existingSkus = new Set(
    (existingProducts || []).map((product) => product.supplier_sku),
  )
  const rows = products
    .filter((product) => !existingSkus.has(product.supplier_sku))
    .map((product) => ({
      ...product,
      image_gallery: product.image_gallery.map((src) => ({
        src,
        alt: product.name,
        fit: "cover",
        position: "center",
      })),
      sizes: [...product.sizes],
      stock_by_size: { ...product.stock_by_size },
      detail_items: [...product.detail_items],
    }))

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("products").insert(rows)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    inserted: rows.length,
    skipped: products.length - rows.length,
    total: products.length,
  })
}
