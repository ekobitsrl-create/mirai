"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, X } from "lucide-react"
import {
  CART_ITEM_ADDED_EVENT,
  type CartItemAddedDetail,
} from "@/lib/cart-context"

const AUTO_CLOSE_MS = 7000

export function CartAddedBanner() {
  const [addedItem, setAddedItem] = useState<CartItemAddedDetail | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const handleItemAdded = (event: Event) => {
      const detail = (event as CustomEvent<CartItemAddedDetail>).detail
      if (!detail?.name) return

      setAddedItem(detail)

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
      closeTimerRef.current = window.setTimeout(() => {
        setAddedItem(null)
        closeTimerRef.current = null
      }, AUTO_CLOSE_MS)
    }

    window.addEventListener(CART_ITEM_ADDED_EVENT, handleItemAdded)
    return () => {
      window.removeEventListener(CART_ITEM_ADDED_EVENT, handleItemAdded)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  if (!addedItem) return null

  return (
    <aside
      aria-label="Prodotto aggiunto al carrello"
      className="fixed inset-x-4 bottom-4 z-[10020] mx-auto max-w-md animate-fade-up border border-primary/50 bg-[#120b1d]/98 p-4 shadow-2xl shadow-black/70 backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px]"
    >
      <button
        type="button"
        onClick={() => setAddedItem(null)}
        aria-label="Chiudi notifica"
        className="absolute right-3 top-3 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
            Prodotto aggiunto al carrello
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-white">
            {addedItem.quantity > 1 && `${addedItem.quantity}× `}
            {addedItem.name}
          </p>
        </div>
      </div>

      <Link
        href="/checkout"
        onClick={() => setAddedItem(null)}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Vai al checkout
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  )
}
