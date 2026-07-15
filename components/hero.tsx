"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const slideImages = [
  { src: "/images/hero-mirai-logo.png", isPortrait: true, scale: "scale-90", position: "object-center" },
  { src: "/images/hero-storefront.png", isPortrait: false, scale: "scale-75", position: "object-center" },
  { src: "/images/hero-model-black.png", isPortrait: true, scale: "scale-[0.70]", position: "object-center" },
  { src: "/images/hero-model-white.png", isPortrait: true, scale: "scale-[0.70]", position: "object-center" },
]

const slideHrefs = [
  "/#prodotti",
  "/collezioni",
  "/chi-siamo",
  "/contatti",
]

export function Hero() {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const totalSlides = slideImages.length

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((p) => (p + 1) % totalSlides)
  }, [totalSlides])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((p) => (p - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slides = t.hero.slides

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#0a0610]">
      {slideImages.map((image, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            i === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
          }`}
        >
          <Image
            src={image.src}
            alt={slides[i]?.title.replace("\n", " ") || ""}
            fill
            className={`object-contain ${image.position} ${image.scale}`}
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end justify-center text-center px-6 pb-24 md:pb-28">
        <div>
          <p
            className={`text-[10px] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 font-sans transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {slides[current]?.subtitle}
          </p>
          <h1
            className={`text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 whitespace-pre-line text-balance transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {slides[current]?.title}
          </h1>
          <Link
            href={slideHrefs[current]}
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-sm hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            {slides[current]?.cta}
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label={t.hero.prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50 transition-all duration-300 rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label={t.hero.nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50 transition-all duration-300 rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slideImages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${t.hero.goToSlide} ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-foreground/40 hover:bg-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
