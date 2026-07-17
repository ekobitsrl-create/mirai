import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BellRing, MapPin, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Negozio fisico - Coming soon",
  description: "Il primo spazio fisico MIRAI LAB STORE è in arrivo. Scopri in anteprima il progetto e unisciti alla community.",
}

export default function NegozioPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b] text-white">
      <Navbar />

      <section className="relative px-5 pb-20 pt-36 sm:px-6 sm:pt-40 lg:min-h-[92svh] lg:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(148,92,255,0.18),transparent_30%),radial-gradient(circle_at_88%_68%,rgba(213,77,255,0.09),transparent_32%)]" />
        <div className="pointer-events-none absolute left-1/2 top-28 h-px w-[88vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-primary shadow-[0_0_32px_rgba(159,134,255,0.16)]">
              <MapPin className="h-3.5 w-3.5" /> MIRAI LAB / Spazio fisico
            </div>

            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/40">Prossima apertura</p>
            <h1 className="mt-3 max-w-xl font-bold uppercase leading-[0.9] tracking-[-0.055em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <span className="block text-[clamp(2.5rem,6.5vw,5.5rem)]">Coming</span>
              <span className="block bg-gradient-to-r from-[#c8baff] via-primary to-[#e26cff] bg-clip-text text-[clamp(2.5rem,6.5vw,5.5rem)] text-transparent drop-shadow-[0_0_25px_rgba(159,134,255,0.28)]">soon.</span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
              Un punto d’incontro tra streetwear, custom culture e persone. Stiamo preparando il primo spazio MIRAI: data, indirizzo e accessi verranno svelati alla community.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/community" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5">
                Entra nella community <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-primary/60 hover:text-white">
                <BellRing className="h-3.5 w-3.5" /> Ricevi gli aggiornamenti
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 border-y border-white/10 py-5">
              {[
                ["01", "Store"],
                ["∞", "Culture"],
                ["You", "Community"],
              ].map(([value, label], index) => (
                <div key={label} className={`px-3 ${index > 0 ? "border-l border-white/10" : ""}`}>
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-white/35">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mirai-neon-frame mirai-neon-breathe relative mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[#100c16] p-2 sm:p-3">
              <div className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_18px_rgba(159,134,255,0.9)]" />
              <video
                className="max-h-[70svh] w-full rounded-[1.25rem] bg-black object-contain"
                src="/videos/physical-store-coming-soon.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Anteprima del futuro negozio fisico MIRAI LAB STORE"
              />
              <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-2.5 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8">
                <span className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Work in progress
                </span>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_12px_rgba(159,134,255,1)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
