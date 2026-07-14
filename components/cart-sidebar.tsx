"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function CartSidebar() {
  const { items, removeItem, updateQuantity, getTotal, itemCount, clearCart } = useCart()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label={t.cart.title} className="relative text-[#6b5f7d] hover:text-[#1a1025] transition-colors">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-background border-border !w-full sm:!max-w-md px-5">
        <SheetHeader>
          <SheetTitle className="text-foreground text-lg tracking-widest uppercase">
            {t.cart.title} ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 opacity-30" />
            <p className="text-sm tracking-wide">{t.cart.empty}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 px-6 py-2.5 border border-foreground/20 text-foreground text-xs font-medium tracking-widest uppercase hover:border-primary hover:text-primary transition-colors rounded-sm"
            >
              {t.cart.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-5 px-5">
              <div className="flex flex-col gap-4 py-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-3 border-b border-border">
                    <div className="relative w-20 h-24 flex-shrink-0 bg-card rounded-sm overflow-hidden">
                      <Image
                        src={item.image_url || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.cart.size}: {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={t.cart.decreaseQuantity}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-medium text-foreground w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={t.cart.increaseQuantity}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {"\u20AC"}{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t.cart.remove}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{t.cart.total}</span>
                <span className="text-lg font-bold text-foreground">
                  {"\u20AC"}{getTotal().toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors"
              >
                {t.cart.checkout}
              </Link>
              <p className="text-center text-[11px] text-muted-foreground mt-2">
                {t.cart.noAccountRequired}
              </p>
              <button
                onClick={clearCart}
                className="w-full mt-2 py-2.5 text-xs text-muted-foreground tracking-wider uppercase hover:text-foreground transition-colors"
              >
                {t.cart.clearCart}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
