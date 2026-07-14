"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"

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
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
}

export function ShopGrid({
  products,
  parentCategories,
  subcategories,
}: {
  products: Product[]
  parentCategories: Category[]
  subcategories: Category[]
}) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const { addItem } = useCart()

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Build hierarchy
  const sections = useMemo(() => {
    return parentCategories.map((parent) => {
      const subs = subcategories.filter((c) => c.parent_id === parent.id)
      const subSlugs = subs.map((s) => s.slug)
      const parentProducts = products.filter((p) => subSlugs.includes(p.category))
      return { parent, subs, products: parentProducts }
    })
  }, [parentCategories, subcategories, products])

  return (
    <div className="pt-24 pb-20">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2 font-sans">Shop</p>
        <h1
          className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-3"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Tutte le Collezioni
        </h1>
        <p className="text-muted-foreground text-sm">
          {products.length} prodott{products.length === 1 ? "o" : "i"} in {parentCategories.length} collezioni
        </p>
      </div>

      {/* Sections per parent category */}
      <div className="flex flex-col gap-20">
        {sections.map(({ parent, subs, products: sectionProducts }) => (
          <section key={parent.id} className="max-w-7xl mx-auto px-6 w-full">
            {/* Category header */}
            <div className="flex items-end justify-between mb-8 border-b border-border pb-4">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {parent.name}
                </h2>
                {parent.description && (
                  <p className="text-muted-foreground text-sm mt-1 max-w-xl">{parent.description}</p>
                )}
              </div>
              <Link
                href={`/collezione/${parent.slug}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs tracking-widest uppercase text-primary hover:text-primary/80 font-semibold transition-colors shrink-0"
              >
                Vedi Tutto <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Subcategory chips */}
            <div className="flex items-center gap-2 overflow-x-auto mb-8" style={{ scrollbarWidth: "none" }}>
              {subs.map((sub) => {
                const count = products.filter((p) => p.category === sub.slug).length
                return (
                  <Link
                    key={sub.id}
                    href={`/collezione/${parent.slug}?sub=${sub.slug}`}
                    className="shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                  >
                    {sub.name}
                    {count > 0 && <span className="ml-1.5 opacity-60">({count})</span>}
                  </Link>
                )
              })}
            </div>

            {/* Products grid for this category */}
            {sectionProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {sectionProducts.slice(0, 4).map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    addItem={addItem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-sm">Prodotti in arrivo</p>
              </div>
            )}

            {/* Show "Vedi tutto" on mobile or if more than 4 products */}
            {(sectionProducts.length > 4 || true) && (
              <div className="mt-6 text-center sm:text-left">
                <Link
                  href={`/collezione/${parent.slug}`}
                  className="inline-flex items-center justify-center px-8 py-3 bg-secondary text-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  Vedi tutta la collezione {parent.name}
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  index,
  wishlist,
  toggleWishlist,
  addItem,
}: {
  product: any
  index: number
  wishlist: string[]
  toggleWishlist: (id: string) => void
  addItem: (item: any) => void
}) {
  return (
    <article
      className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${(index % 8) * 50}ms`, animationFillMode: "both" }}
    >
      <Link href={`/prodotto/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-card mb-3">
          <Image
            src={product.image_url || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {product.is_new && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
              Nuovo
            </span>
          )}
          {!product.in_stock && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-muted-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
              Esaurito
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleWishlist(product.id)
            }}
            aria-label={wishlist.includes(product.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
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
                  })
                }}
                className="w-full py-3 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-all duration-300"
              >
                Aggiungi al Carrello
              </button>
            </div>
          )}
        </div>
      </Link>
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-primary mb-0.5">{"\u039CIRAI"}</p>
        <h3 className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-foreground">
          {"\u20AC"}{Number(product.price).toFixed(2)}
        </p>
      </div>
    </article>
  )
}
