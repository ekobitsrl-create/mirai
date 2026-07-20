"use client"

import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/lib/language-context"
import { getCategoryImage, shouldContainCategoryImage } from "@/lib/category-images"
import { ArrowRight } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
}

export function Collections({ categories = [] }: { categories?: Category[] }) {
  const { ref, isVisible } = useScrollAnimation(0.1)
  const { t } = useLanguage()

  if (categories.length === 0) return null

  return (
    <section id="collezioni" className="mirai-neon-divider relative overflow-hidden bg-secondary/20 py-16 md:py-24" ref={ref}>
      <div className="mirai-aurora-orb -left-40 top-1/3 h-96 w-96" />
      <div className="relative max-w-7xl mx-auto px-6">
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
              className={`mirai-neon-frame mirai-neon-lift group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/50 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: isVisible ? `${i * 0.1}s` : "0s" }}
            >
              <Image
                src={getCategoryImage(cat.slug, cat.image_url)}
                alt={cat.name}
                fill
                className={`${shouldContainCategoryImage(cat.slug) ? "object-contain p-3" : "object-cover"} transition-transform duration-500 ease-out group-hover:scale-105`}
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

            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className={`text-center mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="/collezioni"
            className="mirai-neon-outline inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
          >
            {t.collections.viewAll || "Vedi Tutte le Collezioni"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
