"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Heart, ArrowLeft } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"

// Mapping immagini locali per slug categoria
const categoryImages: Record<string, string> = {
  // T-shirts
  "t-shirt": "/images/collection-tshirt.jpg",
  "tshirt": "/images/collection-tshirt.jpg",
  "t-shirts": "/images/collection-tshirt.jpg",
  "magliette": "/images/collection-tshirt.jpg",
  // Caps / Hats / Headwear - usando le foto reali dei cappelli
  "cappelli": "/images/cap-ny-red-crystal.jpg",
  "caps": "/images/cap-ny-red-crystal.jpg",
  "hats": "/images/cap-ny-red-crystal.jpg",
  "cappellini": "/images/cap-ny-red-crystal.jpg",
  "headwear": "/images/cap-ny-red-crystal.jpg",
  // Hoodies / Sweatshirts
  "felpe": "/images/collection-apparel.jpg",
  "hoodies": "/images/collection-apparel.jpg",
  "sweatshirts": "/images/collection-apparel.jpg",
  // Accessories
  "accessori": "/images/collection-accessories.jpg",
  "accessories": "/images/collection-accessories.jpg",
  // Apparel / Abbigliamento
  "apparel": "/images/collection-apparel.jpg",
  "abbigliamento": "/images/collection-apparel.jpg",
  "clothing": "/images/collection-apparel.jpg",
  // Pantaloni / Pants
  "pantaloni": "/images/collection-apparel.jpg",
  "pants": "/images/collection-apparel.jpg",
  "jeans": "/images/collection-apparel.jpg",
  // New arrivals
  "nuovi-arrivi": "/images/collection-tshirt.jpg",
  "new-arrivals": "/images/collection-tshirt.jpg",
}

const defaultImage = "/images/collection-tshirt.jpg"

function getCategoryImage(slug: string, dbImage: string | null): string {
  if (dbImage) return dbImage
  return categoryImages[slug.toLowerCase()] || defaultImage
}

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

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
}

export function CollectionProducts({
  category,
  products,
  parentCategories,
  subcategories,
  isParent,
}: {
  category: Category
  products: Product[]
  parentCategories: Category[]
  subcategories: Category[]
  isParent: boolean
}) {
  const searchParams = useSearchParams()
  const subParam = searchParams.get("sub")
  
  const [wishlist, setWishlist] = useState<string[]>([])
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const { addItem } = useCart()
  const { t } = useLanguage()

  // Initialize activeSubcategory from URL parameter
  useEffect(() => {
    if (subParam && subcategories.some(s => s.slug === subParam)) {
      setActiveSubcategory(subParam)
    }
  }, [subParam, subcategories])

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Filter products by selected subcategory
  const filteredProducts = activeSubcategory
    ? products.filter((p) => p.category === activeSubcategory)
    : products

  return (
    <div className="pt-24">
      {/* Hero banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-end bg-secondary/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={getCategoryImage(category.slug, category.image_url)}
            alt={category.name}
            fill
            className="object-contain p-8"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-10">
          <Link
            href="/collezioni"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Tutte le Collezioni
          </Link>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground mt-2 text-lg">
              {category.description}
            </p>
          )}
          <p className="text-sm text-primary mt-2">
            {filteredProducts.length} prodott{filteredProducts.length === 1 ? "o" : "i"}
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            {/* Parent categories navigation */}
            <h3 className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Collezioni
            </h3>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 mb-8">
              {parentCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collezione/${cat.slug}`}
                  className={`text-sm whitespace-nowrap px-3 py-2 rounded-sm transition-colors ${
                    cat.slug === (isParent ? category.slug : "")
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Subcategory filters (only for parent categories) */}
            {isParent && subcategories.length > 0 && (
              <>
                <h3 className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  Sottocategorie
                </h3>
                <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  <button
                    onClick={() => setActiveSubcategory(null)}
                    className={`text-sm whitespace-nowrap px-3 py-2 rounded-sm transition-colors text-left ${
                      activeSubcategory === null
                        ? "bg-primary/15 text-primary font-medium border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    Tutti ({products.length})
                  </button>
                  {subcategories.map((sub) => {
                    const count = products.filter(
                      (p) => p.category === sub.slug
                    ).length
                    return (
                      <button
                        key={sub.id}
                        onClick={() =>
                          setActiveSubcategory(
                            activeSubcategory === sub.slug ? null : sub.slug
                          )
                        }
                        className={`text-sm whitespace-nowrap px-3 py-2 rounded-sm transition-colors text-left ${
                          activeSubcategory === sub.slug
                            ? "bg-primary/15 text-primary font-medium border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {sub.name} ({count})
                      </button>
                    )
                  })}
                </nav>
              </>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Nessun prodotto in questa collezione.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-primary mt-4 text-sm hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" /> Torna alla Home
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="group">
                    <Link
                      href={`/prodotto/${product.id}`}
                      className="block"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-card mb-4">
                        <Image
                          src={product.image_url || "/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover object-top transition-all duration-[1s] ease-out group-hover:scale-110"
                        />
                        {product.is_new && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
                            Nuovo
                          </span>
                        )}
                        {!product.in_stock && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-secondary text-muted-foreground text-[10px] font-bold tracking-widest uppercase rounded-sm">
                            Esaurito
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleWishlist(product.id)
                          }}
                          aria-label={
                            wishlist.includes(product.id)
                              ? "Rimuovi dai preferiti"
                              : "Aggiungi ai preferiti"
                          }
                          className="absolute top-4 right-4 p-2.5 bg-background/40 backdrop-blur-md rounded-full text-foreground hover:text-primary hover:bg-background/60 transition-all duration-300"
                        >
                          <Heart
                            className={`h-4 w-4 transition-all duration-300 ${
                              wishlist.includes(product.id)
                                ? "fill-primary text-primary scale-110"
                                : ""
                            }`}
                          />
                        </button>
                        {product.in_stock && (
                          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-all duration-500 ease-out">
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
                              className="w-full py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300"
                            >
                              Aggiungi al Carrello
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-primary mb-0.5">
                            {"MIR\u039BI"}
                          </p>
                          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {"\u20AC"}
                          {Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
