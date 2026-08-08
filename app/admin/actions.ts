"use server"

import {
  createClient as createServerClient,
  createUserClient,
  getServerUserWithProfile,
} from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isBlackIslandProduct } from "@/lib/products"
import { MIRAI_SUPPLIER_CATALOG } from "@/lib/mirai-supplier-catalog"
import { isAdminEmail } from "@/lib/admin"
import { normalizeDiscountCode, type DiscountType } from "@/lib/discounts"

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

type ProductGalleryImage = {
  src: string
  alt: string
  fit: "contain" | "cover"
  position: string
}

function isAllowedProductImageUrl(value: unknown): value is string {
  return typeof value === "string" && (/^https?:\/\//i.test(value) || value.startsWith("/"))
}

function parseProductImages(formData: FormData, productName: string) {
  const submittedPrimary = formData.get("image_url")
  const primary = isAllowedProductImageUrl(submittedPrimary) ? submittedPrimary : null
  let submittedGallery: unknown = []

  try {
    submittedGallery = JSON.parse((formData.get("image_gallery") as string) || "[]")
  } catch {
    submittedGallery = []
  }

  const image_gallery: ProductGalleryImage[] = []
  const addImage = (candidate: unknown) => {
    const src = typeof candidate === "string"
      ? candidate
      : candidate && typeof candidate === "object" && "src" in candidate
        ? (candidate as { src?: unknown }).src
        : null

    if (!isAllowedProductImageUrl(src) || image_gallery.some((image) => image.src === src)) return

    const details = candidate && typeof candidate === "object"
      ? candidate as { alt?: unknown; fit?: unknown; position?: unknown }
      : null
    const submittedAlt = typeof details?.alt === "string" ? details.alt.trim().slice(0, 180) : ""
    const submittedPosition = typeof details?.position === "string"
      ? details.position.trim().slice(0, 80)
      : ""

    image_gallery.push({
      src,
      alt: submittedAlt && submittedAlt !== "Immagine prodotto"
        ? submittedAlt
        : productName || "Immagine prodotto",
      fit: details?.fit === "cover" ? "cover" : "contain",
      position: submittedPosition || "center",
    })
  }

  if (Array.isArray(submittedGallery)) submittedGallery.slice(0, 20).forEach(addImage)

  if (primary) {
    const primaryIndex = image_gallery.findIndex((image) => image.src === primary)
    if (primaryIndex === -1) {
      image_gallery.unshift({
        src: primary,
        alt: productName || "Immagine prodotto",
        fit: "contain",
        position: "center",
      })
    } else if (primaryIndex > 0) {
      const [primaryImage] = image_gallery.splice(primaryIndex, 1)
      image_gallery.unshift(primaryImage)
    }
  }

  const normalizedGallery = image_gallery.slice(0, 20)
  return {
    image_url: normalizedGallery[0]?.src || null,
    image_gallery: normalizedGallery.length ? normalizedGallery : null,
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
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) throw new Error("Non autorizzato")

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
  const { sizes, stock_by_size, in_stock } = parseProductInventory(formData)
  const is_new = formData.get("is_new") === "on"
  const productDetails = parseProductDetails(formData)
  const productImages = parseProductImages(formData, name)

  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    category,
    ...productImages,
    sizes,
    stock_by_size,
    in_stock,
    is_new,
    ...productDetails,
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
  const { sizes, stock_by_size, in_stock } = parseProductInventory(formData)
  const is_new = formData.get("is_new") === "on"
  const productDetails = parseProductDetails(formData)
  const productImages = parseProductImages(formData, name)

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      category,
      ...productImages,
      sizes,
      stock_by_size,
      in_stock,
      is_new,
      ...productDetails,
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
  await assertAdmin()
  const supabase = await createServerClient()
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
  const catalogCategories = [
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

  for (const category of catalogCategories) {
    const { data: existingCategory, error: existingCategoryError } = await supabase
      .from("categories")
      .select("id, image_url")
      .eq("slug", category.slug)
      .maybeSingle()

    if (existingCategoryError) throw new Error(existingCategoryError.message)

    if (!existingCategory) {
      const { error: createCategoryError } = await supabase.from("categories").insert(category)

      if (createCategoryError) throw new Error(createCategoryError.message)
      categoryCreated = true
    } else if (existingCategory.image_url !== category.image_url) {
      const { error: updateCategoryError } = await supabase
        .from("categories")
        .update({ image_url: category.image_url })
        .eq("id", existingCategory.id)

      if (updateCategoryError) throw new Error(updateCategoryError.message)
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
  const allowedStatuses = new Set(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
  if (!allowedStatuses.has(status)) throw new Error("Stato ordine non valido")

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .single()

  if (existingOrderError) throw new Error(existingOrderError.message)

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  if (existingOrder.status !== status) {
    try {
      const { sendOrderStatusEmail } = await import("@/lib/email/order-emails")
      await sendOrderStatusEmail(id, status)
    } catch (emailError) {
      console.error("Stato aggiornato, ma email cliente non inviata", emailError)
    }
  }

  revalidatePath("/admin")
}

export async function deleteOrder(formData: FormData) {
  const { supabase } = await assertAdmin()

  const id = formData.get("id") as string

  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

// --- Discount codes ---

function parseDiscountCodeForm(formData: FormData) {
  const code = normalizeDiscountCode(formData.get("code"))
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new Error("Il codice deve contenere 3-32 caratteri: lettere, numeri, trattino o underscore")
  }

  const discountType: DiscountType = formData.get("discount_type") === "fixed"
    ? "fixed"
    : "percentage"
  const value = Number(formData.get("value"))
  if (!Number.isFinite(value) || value <= 0) throw new Error("Inserisci un valore di sconto valido")
  if (discountType === "percentage" && value > 100) {
    throw new Error("La percentuale non può superare il 100%")
  }

  const minimumSubtotal = Number(formData.get("minimum_subtotal") || 0)
  if (!Number.isFinite(minimumSubtotal) || minimumSubtotal < 0) {
    throw new Error("Il subtotale minimo non è valido")
  }

  const rawMaxUses = String(formData.get("max_uses") || "").trim()
  const maxUses = rawMaxUses ? Number(rawMaxUses) : null
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw new Error("Il limite utilizzi deve essere un numero intero positivo")
  }

  const dateValue = (name: string) => {
    const raw = String(formData.get(name) || "").trim()
    if (!raw) return null
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) throw new Error("Data promozione non valida")
    return parsed.toISOString()
  }
  const startsAt = dateValue("starts_at")
  const endsAt = dateValue("ends_at")
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("La scadenza deve essere successiva alla data di inizio")
  }

  return {
    code,
    discount_type: discountType,
    value,
    active: formData.get("active") === "on",
    first_order_only: formData.get("first_order_only") === "on",
    minimum_subtotal: minimumSubtotal,
    starts_at: startsAt,
    ends_at: endsAt,
    max_uses: maxUses,
    updated_at: new Date().toISOString(),
  }
}

export async function createDiscountCode(formData: FormData) {
  await assertAdmin()
  const supabase = await createServerClient()
  const values = parseDiscountCodeForm(formData)
  const { error } = await supabase.from("discount_codes").insert(values)
  if (error?.code === "23505") throw new Error("Esiste già un codice con questo nome")
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function updateDiscountCode(formData: FormData) {
  await assertAdmin()
  const supabase = await createServerClient()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Codice sconto non trovato")

  const { error } = await supabase
    .from("discount_codes")
    .update(parseDiscountCodeForm(formData))
    .eq("id", id)

  if (error?.code === "23505") throw new Error("Esiste già un codice con questo nome")
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function deleteDiscountCode(formData: FormData) {
  await assertAdmin()
  const supabase = await createServerClient()
  const id = String(formData.get("id") || "")
  if (!id) throw new Error("Codice sconto non trovato")

  const { error } = await supabase.from("discount_codes").delete().eq("id", id)
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
