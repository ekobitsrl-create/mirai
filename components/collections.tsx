"use client"

import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/lib/language-context"
import { ArrowRight } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
}

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
  if (dbImage && dbImage.startsWith("http")) return dbImage
  return categoryImages[slug.toLowerCase()] || defaultImage
}

export function Collections({ categories = [] }: { categories?: Category[] }) {
  const { ref, isVisible } = useScrollAnimation(0.1)
  const { t } = useLanguage()

  if (categories.length === 0) return null

  return (
    <section id="collezioni" className="py-16 md:py-24 bg-secondary/30" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">{t.collections.title}</p>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {t.collections.subtitle}
          </h2>
        </div>

        {/* Grid categorie stile e-commerce */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/collezione/${cat.slug}`}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary/50 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: isVisible ? `${i * 0.1}s` : "0s" }}
            >
              <Image
                src={getCategoryImage(cat.slug, cat.image_url)}
                alt={cat.name}
                fill
                className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={i < 2}
                loading={i < 2 ? "eager" : "lazy"}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3
                  className="text-xl md:text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{cat.description}</p>
                )}
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white group-hover:text-primary transition-colors duration-300">
                  {t.collections.shopNow}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>

              {/* Border glow effect on hover */}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className={`text-center mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="/collezioni"
            className="inline-flex items-center gap-2 px-8 py-3 border border-border text-foreground text-xs font-bold tracking-widest uppercase hover:border-primary hover:text-primary transition-all duration-300 rounded-sm"
          >
            {t.collections.viewAll || "Vedi Tutte le Collezioni"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
