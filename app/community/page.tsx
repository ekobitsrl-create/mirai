import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, Eye, MessageCircleMore, Radio, Sparkles, UsersRound } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getServerUserWithProfile } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "MIRAI Society",
  description: "Entra nella MIRAI Society: anteprime sui drop, scelte condivise, contenuti ed esperienze riservate.",
}

const PILLARS = [
  { icon: Eye, label: "Early access", title: "Prima degli altri", description: "Anteprime sui nuovi arrivi, drop e disponibilità limitate." },
  { icon: MessageCircleMore, label: "Voice", title: "Partecipa alle scelte", description: "Sondaggi su prodotti, varianti, iniziative ed eventi MIRAI." },
  { icon: UsersRound, label: "Recognition", title: "Porta il tuo stile", description: "Outfit, contenuti e persone della Society diventano parte del progetto." },
  { icon: CalendarDays, label: "Experiences", title: "Vivi MIRAI", description: "Preview, aperture speciali e incontri nello store di Catania." },
]

export default async function CommunityLandingPage() {
  const { user } = await getServerUserWithProfile()
  const primaryHref = user ? "/community/hub" : "/auth/sign-up?next=/community/hub"
  const primaryLabel = user ? "Apri il Society Hub" : "Entra nella Society"

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b] text-white">
      <Navbar />
      <section className="relative flex min-h-[88svh] items-end overflow-hidden">
        <Image src="/images/store-interior.png" alt="Lo spazio MIRAI LAB STORE" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,11,0.96)_0%,rgba(8,7,11,0.7)_48%,rgba(8,7,11,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#08070b_0%,transparent_42%)]" />
        <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-16 pt-40 md:px-8 md:pb-20">
          <div className="inline-flex items-center gap-2 border border-primary/35 bg-black/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-primary backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> MIRAI Society
          </div>
          <h1 className="mt-6 max-w-5xl text-[clamp(3.4rem,10vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.055em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Costruisci<br /><span className="text-primary">MIRAI</span> con noi.
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Scopri i drop prima degli altri, partecipa alle scelte del brand e accedi alle esperienze riservate alla community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryHref} className="inline-flex min-h-16 items-center gap-3 bg-white px-9 py-5 text-xs font-bold uppercase tracking-[0.18em] text-black shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 sm:px-11 sm:text-sm">
              {primaryLabel} <ArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <Link href="/auth/login?redirectTo=/community/hub" className="inline-flex items-center gap-2 border border-white/25 bg-black/25 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md hover:border-primary/70">
                Sono già membro
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0a12]">
        <div className="mx-auto grid max-w-[1500px] gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <article key={pillar.label} className="bg-[#0d0a12] px-6 py-10 md:px-8">
              <pillar.icon className="h-5 w-5 text-primary" />
              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.24em] text-primary">{pillar.label}</p>
              <h2 className="mt-2 text-lg font-bold uppercase">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/45">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-28">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-primary">The First 100</p>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.05em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            MIRAI<br />Founders.
          </h2>
        </div>
        <div className="border-l border-primary/35 pl-6 sm:pl-10">
          <p className="max-w-2xl text-lg leading-8 text-white/75">
            I primi membri formano il nucleo della Society: persone che partecipano, propongono e vivono il progetto anche fuori dallo shop.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/50 sm:grid-cols-2">
            {["Accesso anticipato ai drop", "Inviti alle esperienze MIRAI", "Voto sulle prossime selezioni", "Possibilità di proporre outfit e contenuti"].map((item) => (
              <div key={item} className="flex items-center gap-3 border-t border-white/10 py-4">
                <span className="h-1.5 w-1.5 bg-primary" /> {item}
              </div>
            ))}
          </div>
          <Link href={primaryHref} className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-white">
            {primaryLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d0a12]">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 px-5 py-14 md:flex-row md:items-center md:px-8">
          <div className="flex items-start gap-4">
            <Radio className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">MIRAI PASS / NFC</p>
              <h2 className="mt-2 text-xl font-bold uppercase">La Society parte dal tuo account.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Il Pass digitale sarà collegato in seguito a esperienze fisiche, identificazione membro e funzioni NFC. Non serve per registrarsi alla community.
              </p>
            </div>
          </div>
          <Link href={primaryHref} className="inline-flex min-h-14 shrink-0 items-center gap-2 bg-primary px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black">
            {primaryLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
