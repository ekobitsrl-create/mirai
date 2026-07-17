"use server"

import { createUserClient, getServerUserWithProfile } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isBlackIslandProduct } from "@/lib/products"

function parseProductInventory(formData: FormData) {
  const sizesRaw = formData.get("sizes") as string
  const sizes = sizesRaw
    ? [...new Set(sizesRaw.split(",").map((size) => size.trim().toUpperCase()).filter(Boolean))]
    : []

  let submittedStock: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse((formData.get("stock_by_size") as string) || "{}")
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) submittedStock = parsed
  } catch {
    submittedStock = {}
  }

  const stock_by_size = Object.fromEntries(
    sizes.map((size) => {
      const quantity = Number(submittedStock[size] ?? 0)
      return [size, Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0]
    }),
  )
  const requestedAvailability = formData.get("in_stock") === "on"
  const in_stock = sizes.length > 0
    ? requestedAvailability && Object.values(stock_by_size).some((quantity) => quantity > 0)
    : requestedAvailability

  return { sizes, stock_by_size, in_stock }
}

function revalidateCatalog(productId?: string) {
  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/google-merchant-feed.xml")
  revalidatePath("/sitemap.xml")
  if (productId) revalidatePath(`/prodotto/${productId}`)
}

async function assertAdmin() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user) throw new Error("Non autenticato")
  if (profile?.role !== "admin") throw new Error("Non autorizzato")

  // Use the signed-in admin session so product policies work even without a service key.
  const supabase = await createUserClient()
  if (!supabase) throw new Error("Sessione admin scaduta")
  return { supabase, user }
}

export async function createProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const { sizes, stock_by_size, in_stock } = parseProductInventory(formData)
  const is_new = formData.get("is_new") === "on"

  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    category,
    image_url: image_url || null,
    sizes,
    stock_by_size,
    in_stock,
    is_new,
  })

  if (error) throw new Error(error.message)

  revalidateCatalog()
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const { sizes, stock_by_size, in_stock } = parseProductInventory(formData)
  const is_new = formData.get("is_new") === "on"

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      category,
      image_url: image_url || null,
      sizes,
      stock_by_size,
      in_stock,
      is_new,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidateCatalog(id)
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidateCatalog(id)
}

export async function deleteBlackIslandProducts() {
  const { supabase } = await assertAdmin()
  const { data: candidates, error: selectError } = await supabase
    .from("products")
    .select("id, name, image_url")

  if (selectError) throw new Error(selectError.message)

  const ids = (candidates || [])
    .filter(isBlackIslandProduct)
    .map((product) => product.id)

  if (ids.length === 0) return { deleted: 0 }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .in("id", ids)

  if (deleteError) throw new Error(deleteError.message)

  revalidateCatalog()
  return { deleted: ids.length }
}

// --- Orders ---

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string
  const status = formData.get("status") as string

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function deleteOrder(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string

  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

// --- Categories ---

export async function createCategory(formData: FormData) {
  const { supabase } = await assertAdmin()

  const name = formData.get("name") as string
  const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const description = formData.get("description") as string || null
  const image_url = formData.get("image_url") as string || null
  const sort_order = parseInt(formData.get("sort_order") as string) || 0

  const { error } = await supabase.from("categories").insert({ name, slug, description, image_url, sort_order })

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const description = formData.get("description") as string || null
  const image_url = formData.get("image_url") as string || null
  const sort_order = parseInt(formData.get("sort_order") as string) || 0

  const { error } = await supabase.from("categories").update({ name, slug, description, image_url, sort_order }).eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
}

// --- Users ---

export async function updateUserRole(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string
  const role = formData.get("role") as string

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}
