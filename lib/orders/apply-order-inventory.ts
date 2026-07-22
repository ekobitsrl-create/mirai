import type { SupabaseClient } from "@supabase/supabase-js"

type InventoryOptions = {
  allowLegacyFallback?: boolean
}

function isMissingInventoryFunction(error: { code?: string; message?: string }) {
  return error.code === "PGRST202"
    || /apply_order_inventory|schema cache/i.test(error.message || "")
}

async function applyLegacyInventoryFallback(supabase: SupabaseClient, orderId: string) {
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, size, quantity")
    .eq("order_id", orderId)

  if (itemsError) throw itemsError

  const groupedItems = new Map<string, { productId: string; size: string; quantity: number }>()
  for (const item of items || []) {
    if (!item.product_id || !item.size) continue

    const key = `${item.product_id}:${item.size}`
    const current = groupedItems.get(key)
    groupedItems.set(key, {
      productId: item.product_id,
      size: item.size,
      quantity: (current?.quantity || 0) + Number(item.quantity || 0),
    })
  }

  for (const item of groupedItems.values()) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_by_size")
      .eq("id", item.productId)
      .maybeSingle()

    if (productError) throw productError
    if (!product) continue

    const stock = product.stock_by_size && typeof product.stock_by_size === "object"
      ? { ...product.stock_by_size }
      : {}
    const currentQuantity = Math.max(0, Number(stock[item.size] || 0))
    stock[item.size] = Math.max(0, currentQuantity - item.quantity)

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock_by_size: stock,
        in_stock: Object.values(stock).some((quantity) => Number(quantity) > 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.productId)

    if (updateError) throw updateError
  }
}

export async function applyOrderInventory(
  supabase: SupabaseClient,
  orderId: string,
  options: InventoryOptions = {},
) {
  const { error } = await supabase.rpc("apply_order_inventory", { p_order_id: orderId })
  if (!error) return

  if (options.allowLegacyFallback && isMissingInventoryFunction(error)) {
    await applyLegacyInventoryFallback(supabase, orderId)
    return
  }

  if (!options.allowLegacyFallback && isMissingInventoryFunction(error)) return
  throw error
}
