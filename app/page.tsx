import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"

import { Hero } from "@/components/hero"
import { Collections } from "@/components/collections"
import { ProductGrid } from "@/components/product-grid"
import { Features } from "@/components/features"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { withDemoProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "MIRAI - Streetwear & Cappelli Custom | Moda Urbana Made in Italy",
  description: "Scopri la collezione MIRAI: streetwear esclusivo, cappelli custom New Era con cristalli e borchie, pezzi unici fatti a mano. Spedizione gratuita.",
  openGraph: {
    title: "MIRAI - Streetwear & Cappelli Custom",
    description: "Streetwear esclusivo e cappelli custom New Era. Pezzi unici fatti a mano. Made in Italy.",
  },
  alternates: { canonical: "/" },
}

export default async function Home() {
  let products: any[] = []
  let categories: any[] = []
  try {
    const supabase = await createClient()
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(32),
      supabase.from("categories").select("*").is("parent_id", null).order("name", { ascending: true }),
    ])
    products = withDemoProducts(prodRes.data || []).slice(0, 8)
    categories = catRes.data || []
  } catch (e) {
    console.error("[v0] Failed to fetch data:", e)
  }

  products = withDemoProducts(products).slice(0, 8)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Collections categories={categories} />
      <ProductGrid products={products} />
      <Features />
      <Newsletter />
      <Footer />
    </main>
  )
}
