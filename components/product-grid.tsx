"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/lib/language-context"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  sizes: string[]
  in_stock: boolean
  is_new: boolean
  stock_by_size?: Record<string, number>
}

export function ProductGrid({ products, title, subtitle }: { products: Product[]; title?: string; subtitle?: string }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const { addItem } = useCart()
  const { ref, isVisible } = useScrollAnimation(0.05)
  const { t } = useLanguage()

  const displayTitle = title || t.products.title
  const displaySubtitle = subtitle || t.products.subtitle

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <section id="prodotti" className="py-16 md:py-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">{displaySubtitle}</p>
          <h2
            className="text-2xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {displayTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <article
              key={product.id}
              className={`group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: isVisible ? `${(i % 4) * 0.08}s` : "0s" }}
            >
              <Link href={`/prodotto/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-card mb-3">
                  <Image
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {product.is_new && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
                      {t.products.new}
                    </span>
                  )}
                  {!product.in_stock && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-muted-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
                      {t.products.outOfStock}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleWishlist(product.id)
                    }}
                    aria-label={wishlist.includes(product.id) ? t.products.removeFromWishlist : t.products.addToWishlist}
                    className="absolute top-3 right-3 p-2 bg-background/30 backdrop-blur-sm rounded-full text-foreground hover:text-primary transition-all duration-300"
                  >
                    <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                  </button>

                  {product.in_stock && (
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          addItem({
                            productId: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image_url: product.image_url,
                            size: product.sizes?.[0] || "OS",
                            maxQuantity: product.stock_by_size?.[product.sizes?.[0] || "OS"],
                          })
                        }}
                        className="w-full py-3 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-all duration-300"
                      >
                        {t.products.addToCart}
                      </button>
                      {(product.sizes?.length > 0) && (
                        <p className="text-center text-[10px] text-foreground/60 mt-1.5">
                          {product.sizes.length} {product.sizes.length === 1 ? t.products.size : t.products.sizes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary mb-0.5">{"MIR\u039BI"}</p>
                <h3 className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-foreground">
                  {"\u20AC"}{Number(product.price).toFixed(2)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className={`text-center mt-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <Link
            href="/collezioni"
            className="inline-flex items-center justify-center px-10 py-3.5 border border-border text-foreground text-xs font-bold tracking-widest uppercase hover:border-primary hover:text-primary transition-all duration-300 rounded-sm"
          >
            {t.products.viewAll}
          </Link>
        </div>
      </div>
    </section>
  )
}
