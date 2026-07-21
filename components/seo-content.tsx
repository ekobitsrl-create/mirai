import Link from "next/link"
import { ArrowRight, MapPin, Sparkles } from "lucide-react"
import type { CategorySeo } from "@/lib/seo"

const HOME_PILLARS = [
  {
    title: "Abbigliamento streetwear online",
    text: "T-shirt oversize, camicie, bermuda e nuovi drop urban selezionati per costruire il tuo fit.",
    href: "/collezioni",
    label: "Esplora le collezioni",
  },
  {
    title: "Cappelli custom",
    text: "Cristalli, strass e dettagli premium trasformano ogni cappello in un pezzo riconoscibile.",
    href: "/collezione/cappelli",
    label: "Scopri i cappelli",
  },
  {
    title: "T-shirt personalizzate online",
    text: "Carica una grafica o aggiungi una scritta e crea la tua heavy tee nel MIRAI Custom Lab.",
    href: "/custom-lab",
    label: "Apri il Custom Lab",
  },
]

export function HomeSeoContent() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#0d0b11] px-6 py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              <MapPin className="h-3.5 w-3.5" /> MIRAI / Catania
            </p>
            <h2 className="mt-4 max-w-xl font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase leading-tight tracking-[-0.04em] sm:text-5xl">
              Streetwear a Catania, online e in store.
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-sm leading-7 text-white/55 sm:text-base">
              MIRAI LAB STORE è un concept streetwear nato a Catania. Uniamo abbigliamento urban uomo, capi oversize e custom culture in uno shop online e nel futuro spazio fisico di Via Umberto 95.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-[0.18em]">
              <Link href="/negozio" className="inline-flex items-center gap-2 text-primary transition-colors hover:text-white">
                Negozio streetwear Catania <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/chi-siamo" className="inline-flex items-center gap-2 text-white/55 transition-colors hover:text-white">
                Il concept MIRAI <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {HOME_PILLARS.map((pillar) => (
            <article key={pillar.title} className="bg-[#100e14] p-7 sm:p-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-lg font-bold uppercase tracking-[-0.02em]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/45">{pillar.text}</p>
              <Link href={pillar.href} className="mt-6 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-white">
                {pillar.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const CATALOG_LINKS = [
  { title: "T-shirt oversize streetwear", text: "Heavy tee, fit boxy e grafiche urban.", href: "/collezione/t-shirt" },
  { title: "Cappelli custom", text: "Modelli con cristalli, strass e dettagli premium.", href: "/collezione/cappelli" },
  { title: "Camicie oversize uomo", text: "Layering rilassato e pattern streetwear.", href: "/collezione/camicie" },
  { title: "Bermuda streetwear uomo", text: "Shorts e pantaloni urban dalle proporzioni ampie.", href: "/collezione/pantaloni" },
]

export function CatalogSeoContent() {
  return (
    <section className="border-t border-white/10 bg-[#0d0b11] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Shop MIRAI</p>
          <h2 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase tracking-[-0.04em] sm:text-4xl">
            Abbigliamento streetwear online
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
            Scopri lo shop streetwear italiano MIRAI: abbigliamento oversize uomo, accessori custom e selezioni urban acquistabili online con schede dedicate a fit, taglie e composizione.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATALOG_LINKS.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-primary/45 hover:bg-primary/[0.06]">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{item.title}</h3>
              <p className="mt-3 text-xs leading-5 text-white/40">{item.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                Guarda la categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CategorySeoContent({ seo }: { seo: CategorySeo }) {
  return (
    <section className="border-t border-border bg-card/35 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Guida alla categoria</p>
        <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
          {seo.heading}
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{seo.intro}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {seo.details.map((detail) => (
            <article key={detail.title} className="rounded-2xl border border-border bg-background/45 p-6 sm:p-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-foreground">{detail.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-xs leading-6 text-muted-foreground">
          Vuoi capire meglio fit, materiali e abbinamenti? Consulta le nostre <Link href="/guide" className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-foreground">guide streetwear</Link>.
        </p>
      </div>
    </section>
  )
}
