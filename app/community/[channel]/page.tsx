import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getServerUserWithProfile } from "@/lib/supabase/server"

const CHANNELS = {
  "first-look": {
    label: "Anteprime",
    title: "First Look",
    description: "Capi, collaborazioni e custom piece prima della pubblicazione.",
    openToMembers: true,
    eyebrow: "Members preview",
    notes: ["Nuovi capi prima dello shop", "Dettagli e lavorazioni in anteprima", "Accessi anticipati comunicati qui"],
  },
  "after-hours": {
    label: "Podcast",
    title: "After Hours",
    description: "Puntate, ospiti e note audio disponibili in anticipo per i membri.",
    openToMembers: false,
    eyebrow: "Audio room",
    notes: ["Podcast MIRAI", "Interviste e backstage", "Ascolto anticipato per i membri"],
  },
  "inner-circle": {
    label: "Social room",
    title: "Inner Circle",
    description: "Uno spazio moderato per parlare di outfit, musica, idee e cultura urbana.",
    openToMembers: false,
    eyebrow: "Community room",
    notes: ["Profili e conversazioni", "Room tematiche", "Moderazione MIRAI"],
  },
  signal: {
    label: "News & eventi",
    title: "Signal",
    description: "Aperture, eventi, listening session e comunicazioni riservate.",
    openToMembers: true,
    eyebrow: "Private signal",
    notes: ["Avvisi riservati", "Date e aperture", "Eventi e listening session"],
  },
} as const

type ChannelKey = keyof typeof CHANNELS

export const metadata: Metadata = {
  title: "MIRAI Community",
  robots: { index: false, follow: false },
}

export default async function CommunityChannelPage({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: channelSlug } = await params
  if (!(channelSlug in CHANNELS)) notFound()

  const channel = CHANNELS[channelSlug as ChannelKey]
  const { user, profile } = await getServerUserWithProfile()
  if (!user) redirect(`/auth/login?redirectTo=/community/${channelSlug}`)

  const memberProfile = profile as { role?: string | null } | null
  const isAdmin = memberProfile?.role === "admin" || user.email === "admin@mirai.store"
  const canEnter = channel.openToMembers || isAdmin

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-6 sm:pt-40">
        <Link href="/community" className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Community Hub
        </Link>

        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">{channel.eyebrow}</p>
            <h1 className="mt-4 text-[clamp(2.6rem,7vw,5.8rem)] font-black uppercase leading-[0.88] tracking-[-0.055em]">{channel.title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">{channel.description}</p>
          </div>
          <div className="rounded-[1.75rem] border border-primary/25 bg-[#120d19] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.4),0_0_50px_rgba(159,134,255,0.1)]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-primary">{channel.label}</span>
              {canEnter ? <Sparkles className="h-5 w-5 text-primary" /> : <LockKeyhole className="h-5 w-5 text-white/35" />}
            </div>
            <h2 className="mt-6 text-xl font-bold uppercase">{canEnter ? "Accesso disponibile" : "Apertura in arrivo"}</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">
              {canEnter
                ? "Il tuo accesso è attivo. I primi contenuti verranno pubblicati direttamente in questa pagina."
                : "Il tuo MIRAI PASS è valido: questo canale comparirà come aperto appena sarà pronto."}
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-3 sm:grid-cols-3">
          {channel.notes.map((note, index) => (
            <div key={note} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary">0{index + 1}</span>
              <p className="mt-4 text-sm font-medium text-white/75">{note}</p>
            </div>
          ))}
        </section>

        {isAdmin && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 text-sm text-white/55">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" /> Vista amministratore: puoi entrare e controllare anche i canali non ancora aperti ai membri.
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
