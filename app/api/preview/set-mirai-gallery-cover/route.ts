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
  const { data: products, error: selectError } = await supabase
    .from("products")
    .select("id, name, image_url, image_gallery, supplier_sku")
    .like("supplier_sku", "MIRAI-%")

  if (selectError) return response({ ok: false, error: selectError.message }, 500)

  const updates = await Promise.all((products || []).map(async (product) => {
    const sourceGallery = Array.isArray(product.image_gallery) && product.image_gallery.length > 0
      ? product.image_gallery
      : product.image_url
        ? [product.image_url]
        : []
    const imageGallery = sourceGallery.map((image) => {
      const normalized = typeof image === "string" ? { src: image } : image
      return {
        ...normalized,
        alt: normalized.alt || product.name,
        fit: "cover",
        position: "center",
      }
    })
    const { error } = await supabase
      .from("products")
      .update({ image_gallery: imageGallery })
      .eq("id", product.id)

    return { id: product.id, images: imageGallery.length, error: error?.message || null }
  }))

  const failures = updates.filter((update) => update.error)
  if (failures.length > 0) return response({ ok: false, failures }, 500)

  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
  for (const product of products || []) revalidatePath(`/prodotto/${product.id}`)

  return response({
    ok: true,
    updated: updates.length,
    images: updates.reduce((total, update) => total + update.images, 0),
  })
}
