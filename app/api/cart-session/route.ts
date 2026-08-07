import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : ""
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : []

    if (!sessionId || sessionId.length > 80) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 })
    }

    const cleanItems = items.flatMap((value: unknown) => {
      if (!value || typeof value !== "object") return []
      const item = value as Record<string, unknown>
      const productId = typeof item.productId === "string" ? item.productId.slice(0, 160) : ""
      const name = typeof item.name === "string" ? item.name.slice(0, 300) : ""
      const price = Number(item.price)
      const rawQuantity = Number(item.quantity)
      const quantity = Number.isFinite(rawQuantity)
        ? Math.max(1, Math.min(10, Math.floor(rawQuantity)))
        : 1
      const size = typeof item.size === "string" ? item.size.slice(0, 40) : "Unica"
      const image_url = typeof item.image_url === "string" ? item.image_url.slice(0, 2000) : null

      if (!productId || !name || !Number.isFinite(price) || price < 0) return []
      return [{ productId, name, price, quantity, size, image_url }]
    })

    const itemCount = cleanItems.reduce((sum, item) => sum + item.quantity, 0)
    const total = Number(cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("cart_sessions")
      .upsert({
        id: sessionId,
        status: cleanItems.length ? "active" : "cleared",
        items: cleanItems,
        item_count: itemCount,
        total,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select("id, status")
      .single()

    if (error) {
      console.error("[cart-session] Supabase write failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json({ error: "Save failed", code: error.code }, { status: 500 })
    }

    return NextResponse.json({ ok: true, session: data }, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("[cart-session] Invalid request", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
