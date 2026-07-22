import Link from "next/link"
import { ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SEO_GUIDES } from "@/lib/seo-guides"
import { buildSeoMetadata, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo"

const GUIDE_DESCRIPTION =
  "Guide MIRAI su fit oversize, tessuti, outfit streetwear, cura dei capi, t-shirt personalizzate e cappelli custom."

export const metadata = buildSeoMetadata({
  title: "Guide streetwear: fit, outfit e custom",
  description: GUIDE_DESCRIPTION,
  path: "/guide",
  keywords: [
    "guide streetwear",
    "come veste una t-shirt oversize",
    "come creare un outfit streetwear uomo",
    "come personalizzare una t-shirt",
    "cappelli custom come vengono realizzati",
  ],
})

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#09070d] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({
            type: "CollectionPage",
            name: "Guide streetwear MIRAI",
            description: GUIDE_DESCRIPTION,
            path: "/guide",
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guide streetwear", path: "/guide" },
          ])),
        }}
      />
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-40 sm:pb-20">
        <div className="pointer-events-none absolute left-1/2 top-16 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              <BookOpen className="h-4 w-4" /> MIRAI Journal
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-[clamp(2.6rem,7vw,6rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em]">
              Guide <span className="bg-gradient-to-r from-[#c7b8ff] via-primary to-[#d54dff] bg-clip-text text-transparent">streetwear.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Fit, materiali, abbinamenti e custom culture spiegati in modo concreto. Guide per scegliere meglio i capi e costruire uno stile personale.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SEO_GUIDES.map((guide, index) => (
            <article key={guide.slug} className="group flex min-h-[330px] flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition-colors hover:border-primary/40 hover:bg-primary/[0.05]">
              <div className="flex items-center justify-between">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-mono text-[10px] text-white/25">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.22em] text-primary">{guide.primaryKeyword}</p>
              <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-xl font-bold leading-tight tracking-[-0.025em]">{guide.title}</h2>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/45">{guide.description}</p>
              <Link href={`/guide/${guide.slug}`} className="mt-auto inline-flex items-center gap-2 pt-8 text-[9px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-white">
                Leggi la guida <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
