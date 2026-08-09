import { NextResponse } from "next/server"
import { getDemoProduct, type StoreProduct } from "@/lib/products"
import {
  consumeRateLimit,
  contentLengthWithin,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"
import { createAdminClient, getServerUser } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type SubmittedCartItem = {
  productId: string
  quantity: number
  size: string
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
  }
  if (!contentLengthWithin(request, 64 * 1024)) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
  }
  if (!await consumeRateLimit({ bucket: "cart-session", limit: 120, windowSeconds: 600, request })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await readJsonBody<{ sessionId?: unknown; items?: unknown }>(request, 64 * 1024)
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : ""
    if (!UUID_PATTERN.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 })
    }

    const submittedItems: SubmittedCartItem[] = Array.isArray(body.items)
      ? body.items.slice(0, 50).flatMap((value: unknown) => {
          if (!value || typeof value !== "object") return []
          const item = value as Record<string, unknown>
          const productId = typeof item.productId === "string" ? item.productId.trim().slice(0, 160) : ""
          const rawQuantity = Number(item.quantity)
          const size = typeof item.size === "string" ? item.size.trim().slice(0, 40) : "Unica"
          if (!productId || !Number.isInteger(rawQuantity) || rawQuantity < 1) return []
          return [{ productId, quantity: Math.min(10, rawQuantity), size: size || "Unica" }]
        })
      : []

    const productIds = [...new Set(submittedItems.map((item) => item.productId))]
    const supabase = createAdminClient()
    const { data: databaseProducts, error: productError } = productIds.length
      ? await supabase.from("products").select("id, name, price, image_url, sizes").in("id", productIds)
      : { data: [], error: null }
    if (productError) throw productError

    const products = [
      ...(databaseProducts || []),
      ...productIds.map(getDemoProduct).filter((product): product is StoreProduct => product !== null),
    ]
    const cleanItems = submittedItems.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item.productId)
      if (!product) return []
      const availableSizes = Array.isArray(product.sizes) ? product.sizes : []
      const size = availableSizes.length && !availableSizes.includes(item.size)
        ? availableSizes[0]
        : item.size
      return [{
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        size,
        image_url: product.image_url || null,
      }]
    })

    const itemCount = cleanItems.reduce((sum, item) => sum + item.quantity, 0)
    const total = Number(cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))
    const user = await getServerUser()

    const { data, error } = await supabase
      .from("cart_sessions")
      .upsert({
        id: sessionId,
        user_id: user?.id || null,
        status: cleanItems.length ? "active" : "cleared",
        items: cleanItems,
        item_count: itemCount,
        total,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select("id, status")
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, session: data }, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }
    console.error("[cart-session] Save failed", error instanceof Error ? error.name : "unknown")
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
