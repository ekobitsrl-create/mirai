"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type CartItem = {
  productId: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  size: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("mirai-cart")
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) setItems(parsed)
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
        const existing = prev.find(
          (i) => i.productId === item.productId && i.size === item.size
        )
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.size === item.size
              ? { ...i, quantity: Math.min(10, i.quantity + (item.quantity || 1)) }
              : i
          )
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }]
      })
    },
    []
  )

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size)
        return
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size
          ? { ...i, quantity: Math.min(10, quantity) }
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
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotal, itemCount }}
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
