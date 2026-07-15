"use server"

import { createClient, getServerUserWithProfile } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user) throw new Error("Non autenticato")
  if (profile?.role !== "admin") throw new Error("Non autorizzato")

  // Service client for DB operations
  const supabase = await createClient()
  return { supabase, user }
}

export async function createProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const sizesRaw = formData.get("sizes") as string
  const sizes = sizesRaw
    ? sizesRaw.split(",").map((s) => s.trim().toUpperCase())
    : []
  const in_stock = formData.get("in_stock") === "on"
  const is_new = formData.get("is_new") === "on"

  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    category,
    image_url: image_url || null,
    sizes,
    in_stock,
    is_new,
  })

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const sizesRaw = formData.get("sizes") as string
  const sizes = sizesRaw
    ? sizesRaw.split(",").map((s) => s.trim().toUpperCase())
    : []
  const in_stock = formData.get("in_stock") === "on"
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
      in_stock,
      is_new,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/")
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
