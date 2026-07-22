"use server"

import { createUserClient, getServerUserWithProfile } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isBlackIslandProduct } from "@/lib/products"
import { MIRAI_SUPPLIER_CATALOG } from "@/lib/mirai-supplier-catalog"

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

function parseProductDetails(formData: FormData) {
  const text = (value: FormDataEntryValue | null) => {
    const trimmed = typeof value === "string" ? value.trim() : ""
    return trimmed ? trimmed : null
  }
  const detailItems = ((formData.get("detail_items") as string) || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    brand: text(formData.get("brand")),
    supplier_sku: text(formData.get("supplier_sku")),
    color_name: text(formData.get("color_name")),
    color_hex: text(formData.get("color_hex")),
    fit_note: text(formData.get("fit_note")),
    composition: text(formData.get("composition")),
    care: text(formData.get("care")),
    detail_items: detailItems.length ? detailItems : null,
  }
}

function revalidateCatalog(productId?: string) {
  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/collezioni")
  revalidatePath("/collezione/[slug]", "page")
  revalidatePath("/google-merchant-feed.xml")
  revalidatePath("/google-merchant-feed-minimal.xml")
  revalidatePath("/google-merchant-feed-mirai.xml")
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
    ...parseProductDetails(formData),
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
      ...parseProductDetails(formData),
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

export async function importMiraiSupplierCatalog() {
  const { supabase } = await assertAdmin()
  const catalogSkus = MIRAI_SUPPLIER_CATALOG.map((product) => product.supplier_sku)

  const { data: existingProducts, error: existingProductsError } = await supabase
    .from("products")
    .select("supplier_sku")
    .in("supplier_sku", catalogSkus)

  if (existingProductsError) throw new Error(existingProductsError.message)

  const existingSkus = new Set(
    (existingProducts || [])
      .map((product) => product.supplier_sku)
      .filter((sku): sku is string => Boolean(sku)),
  )
  const missingProducts = MIRAI_SUPPLIER_CATALOG.filter(
    (product) => !existingSkus.has(product.supplier_sku),
  )

  let categoryCreated = false
  if (missingProducts.some((product) => product.category === "canotte")) {
    const { data: canotteCategory, error: canotteCategoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "canotte")
      .maybeSingle()

    if (canotteCategoryError) throw new Error(canotteCategoryError.message)

    if (!canotteCategory) {
      const { error: createCategoryError } = await supabase.from("categories").insert({
        name: "Canotte",
        slug: "canotte",
        description: "Canotte e smanicati streetwear MIRAI.",
        sort_order: 35,
      })

      if (createCategoryError) throw new Error(createCategoryError.message)
      categoryCreated = true
    }
  }

  if (missingProducts.length > 0) {
    const rows = missingProducts.map((product) => ({
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
    const { error: insertError } = await supabase.from("products").insert(rows)

    if (insertError) throw new Error(insertError.message)
  }

  revalidateCatalog()

  return {
    inserted: missingProducts.length,
    skipped: existingSkus.size,
    total: MIRAI_SUPPLIER_CATALOG.length,
    categoryCreated,
  }
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
