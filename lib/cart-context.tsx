"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { CustomizationDetails } from "@/lib/customization"

export type CartItem = {
  productId: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  size: string
  lineId?: string
  customization?: CustomizationDetails
  maxQuantity?: number
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
  }, [hydrated, items])

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
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
            quantity: Math.min(item.maxQuantity ?? 10, item.quantity || 1),
          },
        ]
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
