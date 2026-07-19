import type { Metadata } from "next"
import Link from "next/link"
import { ArrowDown, CheckCircle2, PackageCheck, ScanLine, Sparkles, WandSparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CustomTeeEditor } from "@/components/custom-tee-editor"

export const metadata: Metadata = {
  title: "Custom Lab - Personalizza la tua T-shirt",
  alternates: { canonical: "/custom-lab" },
  description: "Crea la tua T-shirt MIRAI personalizzata: scegli colore, taglia, lato di stampa, testo o grafica e visualizza il risultato in tempo reale.",
  openGraph: {
    title: "MIRAI Custom Lab - Crea la tua T-shirt",
    description: "Disegna online la tua T-shirt streetwear personalizzata e ordinala direttamente dal MIRAI Custom Lab.",
  },
}

const PROCESS = [
  {
    icon: ScanLine,
    number: "01",
    title: "Crea",
    description: "Scegli capo, colore e lato. Aggiungi una frase o carica la tua grafica.",
  },
  {
    icon: CheckCircle2,
    number: "02",
    title: "Controlliamo",
    description: "Il team verifica qualità, posizione e fattibilità prima di mandare tutto in stampa.",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "Produciamo",
    description: "Prepariamo il tuo pezzo singolarmente e lo spediamo con tracking gratuito.",
  },
]

export default function CustomLabPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#09070d] text-white">
      <Navbar />

      <section className="relative px-5 pb-16 pt-36 sm:px-6 sm:pt-40 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(125,70,255,0.19),transparent_28%),radial-gradient(circle_at_10%_35%,rgba(198,74,255,0.08),transparent_22%)]" />
        <div className="pointer-events-none absolute left-1/2 top-28 h-px w-[82vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 grid items-end gap-8 lg:grid-cols-[1fr_420px] lg:gap-14">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-primary shadow-[0_0_28px_rgba(140,90,255,0.16)]">
                <WandSparkles className="h-3.5 w-3.5" /> MIRAI Custom Lab
              </div>
              <h1 className="max-w-2xl font-bold uppercase leading-[0.9] tracking-[-0.055em] text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                <span className="block text-[clamp(2.45rem,6.5vw,4.75rem)]">Make it</span>
                <span className="block bg-gradient-to-r from-[#c7b8ff] via-primary to-[#d54dff] bg-clip-text text-[clamp(2.45rem,6.5vw,4.75rem)] text-transparent drop-shadow-[0_0_24px_rgba(145,90,255,0.2)]">yours.</span>
              </h1>
            </div>
            <div className="pb-2 lg:pb-3">
              <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base">
                Una Heavy Tee, la tua idea. Personalizzala in tempo reale e crea un pezzo che non esiste da nessun’altra parte.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="#editor" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5">
                  Inizia a creare <ArrowDown className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[9px] uppercase tracking-[0.17em] text-white/30">Da 79 € · Spedizione gratuita</span>
              </div>
            </div>
          </div>

          <CustomTeeEditor />
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[#100c16] px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(125,70,255,0.12),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">Dal file al capo</p>
              <h2 className="mt-3 text-2xl font-bold uppercase tracking-[-0.035em] sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Come funziona
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/45">
              Ogni personalizzazione passa da un controllo umano. Se qualcosa non è stampabile, ti contattiamo prima di produrre.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {PROCESS.map((item) => (
              <article key={item.number} className="group relative bg-[#100c16] p-7 transition-colors hover:bg-primary/[0.06] sm:p-9">
                <span className="absolute right-6 top-5 font-mono text-4xl font-black text-white/[0.035] transition-colors group-hover:text-primary/[0.09]">{item.number}</span>
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-8 text-lg font-bold uppercase tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/42">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-primary/20 bg-primary/[0.06] px-6 py-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-white">Pezzo unico, fatto per te</p>
                <p className="mt-1 text-xs leading-5 text-white/40">I prodotti custom non possono essere restituiti, salvo difetti di produzione.</p>
              </div>
            </div>
            <Link href="/contatti" className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-white">
              Hai un progetto speciale? Parliamone
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
