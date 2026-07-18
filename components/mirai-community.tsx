import Link from "next/link"
import { ArrowRight, AudioLines, Eye, MessageCircleMore, Radio, ShieldCheck, Sparkles, TicketCheck, UsersRound } from "lucide-react"

type CommunityMember = {
  id: string
  name: string
  email: string
  createdAt: string
}

const CHANNELS = [
  {
    icon: Eye,
    slug: "first-look",
    name: "First Look",
    label: "Anteprime",
    description: "Capi, collaborazioni e custom piece prima della pubblicazione.",
    status: "Aperto",
    memberOpen: true,
  },
  {
    icon: AudioLines,
    slug: "after-hours",
    name: "After Hours",
    label: "Podcast",
    description: "Puntate, ospiti e note audio disponibili in anticipo per i membri.",
    status: "Aperto",
    memberOpen: true,
  },
  {
    icon: MessageCircleMore,
    slug: "inner-circle",
    name: "Inner Circle",
    label: "Social room",
    description: "Uno spazio per parlare di outfit, musica, idee e cultura urbana.",
    status: "Aperto",
    memberOpen: true,
  },
  {
    icon: Radio,
    slug: "signal",
    name: "Signal",
    label: "News & eventi",
    description: "Aperture, eventi, listening session e comunicazioni riservate.",
    status: "Aperto",
    memberOpen: true,
  },
]

function memberCode(member: CommunityMember) {
  const compactId = member.id.replace(/-/g, "").slice(0, 6).toUpperCase()
  const year = new Date(member.createdAt).getFullYear()
  return `ML-${year}-${compactId}`
}

export function MiraiMemberPass({ member, compact = false }: { member: CommunityMember; compact?: boolean }) {
  const code = memberCode(member)

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-primary/30 bg-[#120d19] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(144,82,255,0.13)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(199,184,255,0.22),transparent_34%),radial-gradient(circle_at_90%_95%,rgba(213,77,255,0.19),transparent_36%)]" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-primary/20 shadow-[0_0_60px_rgba(159,134,255,0.2)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.32em] text-primary">Digital membership</p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-[0.16em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>MIRAI PASS</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" /> Attivo
        </div>
      </div>

      <div className={`relative ${compact ? "mt-10" : "mt-14"}`}>
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Member</p>
        <p className="mt-1 truncate text-lg font-semibold sm:text-xl">{member.name}</p>
        <p className="mt-1 truncate text-xs text-white/40">{member.email}</p>
      </div>

      <div className="relative mt-7 flex items-end justify-between gap-5 border-t border-white/10 pt-5">
        <div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">Member ID</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-white/75">{code}</p>
        </div>
        <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
          {[14, 24, 18, 28, 11, 22, 30, 16, 26, 13, 29, 19, 25].map((height, index) => (
            <span key={index} className="w-[2px] rounded-full bg-white/55" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function CommunityPreview({ member }: { member: CommunityMember }) {
  return (
    <section id="community" className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d0a12] p-5 text-white sm:p-7 lg:p-9">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <MiraiMemberPass member={member} compact />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.22em] text-primary">
            <UsersRound className="h-3.5 w-3.5" /> Community preview
          </div>
          <h2 className="mt-5 text-2xl font-bold uppercase tracking-[-0.035em] sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>Il tuo accesso alla parte interna di MIRAI.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
            Il pass digitale identificherà i membri e aprirà canali riservati, anteprime, podcast ed eventi. Questa è la prima struttura: gli accessi verranno attivati progressivamente.
          </p>
          <Link href="/community" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5">
            Apri il Community Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function AdminCommunityAccess() {
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-primary/30 bg-[#120d19] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(144,82,255,0.13)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(199,184,255,0.22),transparent_34%),radial-gradient(circle_at_90%_95%,rgba(213,77,255,0.19),transparent_36%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" /> Accesso completo
        </div>
      </div>
      <p className="relative mt-10 text-[8px] font-bold uppercase tracking-[0.28em] text-primary">Amministratore</p>
      <h2 className="relative mt-2 text-2xl font-black uppercase tracking-[-0.03em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Tutte le aree sono aperte.</h2>
      <p className="relative mt-3 max-w-lg text-sm leading-6 text-white/45">
        L&apos;account admin entra direttamente nei canali e nelle funzioni della community. Non usa MIRAI PASS, livelli o requisiti membership.
      </p>
    </div>
  )
}

export function CommunityHub({ member, isAdmin = false }: { member: CommunityMember; isAdmin?: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 text-white sm:px-6 sm:pt-40">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {isAdmin ? "Accesso amministratore" : "Members only"}
          </div>
          <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.055em]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            MIRAI<br /><span className="text-primary">Community.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            Non solo prodotti: uno spazio riservato a chi vuole vedere prima, ascoltare prima e partecipare alla costruzione di MIRAI.
          </p>
        </div>
        {isAdmin ? <AdminCommunityAccess /> : <MiraiMemberPass member={member} />}
      </div>

      <section className="mt-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Canali</p>
            <h2 className="mt-2 text-2xl font-bold uppercase tracking-[-0.03em] sm:text-3xl">Dentro il network</h2>
          </div>
          <p className="max-w-md text-xs leading-6 text-white/35">
            {isAdmin
              ? "L'amministratore ha accesso completo a tutti i canali, compresi quelli che verranno attivati in seguito."
              : "Le stanze sono in costruzione. Il tuo account e il MIRAI PASS sono già pronti per ricevere gli accessi."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <Link key={channel.name} href={`/community/${channel.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-primary/35 hover:bg-primary/[0.045]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <channel.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/35">{channel.status}</span>
              </div>
              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.22em] text-primary">{channel.label}</p>
              <h3 className="mt-1 text-lg font-bold uppercase tracking-[-0.02em]">{channel.name}</h3>
              <p className="mt-3 text-sm leading-6 text-white/45">{channel.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.18em] text-primary">
                {isAdmin || channel.memberOpen ? "Entra nel canale" : "Scopri l’accesso"} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 flex flex-col justify-between gap-5 rounded-2xl border border-primary/20 bg-[linear-gradient(115deg,rgba(159,134,255,0.12),rgba(213,77,255,0.04))] p-7 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          {isAdmin ? <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" /> : <TicketCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />}
          <div>
            <h2 className="font-bold uppercase tracking-[-0.02em]">{isAdmin ? "Vista amministratore" : "Il pass crescerà con te"}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              {isAdmin
                ? "Puoi entrare in ogni area della community senza pass, livelli o altre limitazioni."
                : "In seguito potrà raccogliere livelli, accessi agli eventi, vantaggi e partecipazione alla community. Per ora non promettiamo punti o premi: costruiamo prima un’esperienza utile."}
            </p>
          </div>
        </div>
        <Link href={isAdmin ? "/admin" : "/account"} className="inline-flex shrink-0 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-primary hover:text-white">
          {isAdmin ? "Apri il pannello admin" : "Torna all’account"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  )
}
