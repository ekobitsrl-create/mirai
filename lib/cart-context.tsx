"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CustomizationDetails } from "@/lib/customization"
import { getCatalogItemId } from "@/lib/catalog-identifiers"
import { trackMetaEvent } from "@/lib/meta-pixel"
import { trackAddToCart } from "@/lib/posthog-events"

export type CartItem = {
  productId: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  size: string
  lineId?: string
  metaContentId?: string
  customization?: CustomizationDetails
  maxQuantity?: number
}

export const CART_ITEM_ADDED_EVENT = "mirai:cart-item-added"

export type CartItemAddedDetail = {
  name: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string, size: string, lineId?: string) => void
  updateQuantity: (productId: string, size: string, quantity: number, lineId?: string) => void
  clearCart: () => void
  getTotal: () => number
  itemCount: number
  hydrated: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const CART_SESSION_KEY = "mirai-cart-session-id"

function getCartSessionId(hasItems: boolean) {
  let sessionId = window.localStorage.getItem(CART_SESSION_KEY)
  if (!sessionId && hasItems) {
    sessionId = crypto.randomUUID()
    window.localStorage.setItem(CART_SESSION_KEY, sessionId)
  }
  return sessionId
}

async function saveCartSession(sessionId: string, items: CartItem[]) {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch("/api/cart-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, items }),
        keepalive: true,
        cache: "no-store",
      })

      if (response.ok) return

      const payload = await response.json().catch(() => null)
      lastError = new Error(payload?.error || `Cart session save failed (${response.status})`)
    } catch (error) {
      lastError = error
    }

    if (attempt < 3) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt * 700))
    }
  }

  console.error("Cart session tracking failed after retries", lastError)
}

function normalizeStoredCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null

  const candidate = value as Record<string, unknown>
  const productId = typeof candidate.productId === "string" ? candidate.productId.trim() : ""
  const price = Number(candidate.price)
  const rawQuantity = Number(candidate.quantity)
  const rawMaxQuantity = Number(candidate.maxQuantity)

  if (!productId || !Number.isFinite(price) || price < 0) return null
  if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) return null

  const maxQuantity = Number.isFinite(rawMaxQuantity) && rawMaxQuantity > 0
    ? Math.max(1, Math.floor(rawMaxQuantity))
    : undefined
  const quantity = Math.min(
    maxQuantity ?? 10,
    Math.max(1, Math.floor(rawQuantity)),
  )

  return {
    productId,
    name: typeof candidate.name === "string" && candidate.name.trim()
      ? candidate.name
      : "Prodotto MIRAI",
    price,
    image_url: typeof candidate.image_url === "string" ? candidate.image_url : null,
    quantity,
    size: typeof candidate.size === "string" && candidate.size.trim()
      ? candidate.size
      : "Unica",
    lineId: typeof candidate.lineId === "string" ? candidate.lineId : undefined,
    metaContentId: typeof candidate.metaContentId === "string" ? candidate.metaContentId : undefined,
    customization:
      candidate.customization && typeof candidate.customization === "object"
        ? candidate.customization as CustomizationDetails
        : undefined,
    maxQuantity,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("mirai-cart")
      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setItems(parsed.flatMap((item) => {
            const normalizedItem = normalizeStoredCartItem(item)
            return normalizedItem ? [normalizedItem] : []
          }))
        }
      }
    } catch {
      // The cart still works for the current session if storage is unavailable.
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem("mirai-cart", JSON.stringify(items))
    } catch {
      // Ignore blocked storage and keep the in-memory cart active.
    }

    const sessionId = getCartSessionId(items.length > 0)
    if (!sessionId) return

    const timeout = window.setTimeout(() => {
      void saveCartSession(sessionId, items)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [hydrated, items])

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const addedQuantity = Math.min(item.maxQuantity ?? 10, item.quantity || 1)

      setItems((prev) => {
        const existing = prev.find((i) => item.lineId
          ? i.lineId === item.lineId
          : i.productId === item.productId && i.size === item.size && !i.lineId)
        if (existing) {
          return prev.map((i) =>
            (item.lineId ? i.lineId === item.lineId : i.productId === item.productId && i.size === item.size && !i.lineId)
              ? {
                  ...i,
                  maxQuantity: item.maxQuantity ?? i.maxQuantity,
                  quantity: Math.min(item.maxQuantity ?? i.maxQuantity ?? 10, i.quantity + (item.quantity || 1)),
                }
              : i
          )
        }
        return [
          ...prev,
          {
            ...item,
            quantity: addedQuantity,
          },
        ]
      })

      window.dispatchEvent(new CustomEvent<CartItemAddedDetail>(CART_ITEM_ADDED_EVENT, {
        detail: {
          name: item.name,
          quantity: addedQuantity,
        },
      }))

      const contentId = item.metaContentId
        || getCatalogItemId({ id: item.productId }, item.size || "OS")
      trackMetaEvent("AddToCart", {
        content_ids: [contentId],
        content_type: "product",
        value: Number((item.price * addedQuantity).toFixed(2)),
        currency: "EUR",
        contents: [{
          id: contentId,
          quantity: addedQuantity,
          item_price: Number(item.price),
        }],
        num_items: addedQuantity,
      })
      trackAddToCart({
        product_id: contentId,
        product_name: item.name,
        price: Number(item.price),
        currency: "EUR",
        quantity: addedQuantity,
        size: item.size || "OS",
        value: Number((item.price * addedQuantity).toFixed(2)),
      })
    },
    []
  )

  const removeItem = useCallback((productId: string, size: string, lineId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(lineId ? i.lineId === lineId : i.productId === productId && i.size === size && !i.lineId))
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number, lineId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size, lineId)
        return
      }
      setItems((prev) =>
        prev.map((i) =>
          (lineId ? i.lineId === lineId : i.productId === productId && i.size === size && !i.lineId)
          ? { ...i, quantity: Math.min(i.maxQuantity ?? 10, quantity) }
            : i
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => setItems([]), [])

  const getTotal = useCallback(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  )

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotal, itemCount, hydrated }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
