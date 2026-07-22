import Link from "next/link"
import { ArrowDown, CheckCircle2, PackageCheck, ScanLine, Sparkles, WandSparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CustomTeeEditor } from "@/components/custom-tee-editor"
import { buildSeoMetadata, createBreadcrumbJsonLd } from "@/lib/seo"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"

const CUSTOM_LAB_DESCRIPTION =
  "Crea t-shirt personalizzate online con MIRAI Custom Lab: scegli colore e taglia, aggiungi una foto, una scritta o una grafica e guarda l'anteprima."

export const metadata = buildSeoMetadata({
  title: "T-shirt personalizzate online | Custom Lab",
  description: CUSTOM_LAB_DESCRIPTION,
  path: "/custom-lab",
  keywords: [
    "t-shirt personalizzate online",
    "crea t-shirt personalizzata online",
    "maglietta personalizzata con foto",
    "maglietta personalizzata con scritta",
    "t-shirt custom premium",
    "t-shirt personalizzata streetwear",
    "personalizzare t-shirt online",
    "t-shirt personalizzate Catania",
    "MIRAI Custom Lab",
  ],
})

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

const FAQS = [
  {
    question: "Come posso creare la mia t-shirt online?",
    answer: "Scegli colore e taglia, seleziona fronte o retro e aggiungi una scritta oppure carica la tua grafica. L'editor mostra un'anteprima prima dell'ordine.",
  },
  {
    question: "Posso usare una foto o una scritta?",
    answer: "Sì. Puoi creare una maglietta personalizzata con foto, grafica o testo. Usa un file nitido e controlla bene ortografia, contrasto e posizione.",
  },
  {
    question: "Il progetto viene controllato prima della stampa?",
    answer: "Sì. Il team MIRAI verifica qualità del file, posizione e fattibilità. Se qualcosa non è adatto alla produzione, ti contattiamo prima di procedere.",
  },
  {
    question: "Il servizio è disponibile anche a Catania?",
    answer: "Puoi ordinare online da tutta Italia. MIRAI nasce a Catania e il futuro MIRAI LAB STORE di Via Umberto 95 ospiterà anche la custom culture del brand.",
  },
]

const customLabJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/custom-lab#service`,
  name: "MIRAI Custom Lab - T-shirt personalizzate online",
  description: CUSTOM_LAB_DESCRIPTION,
  url: getAbsoluteUrl("/custom-lab"),
  serviceType: "Personalizzazione premium di t-shirt streetwear",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "Italia" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: getAbsoluteUrl("/custom-lab"),
    availableLanguage: "Italian",
  },
}

const customLabFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

export default function CustomLabPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#09070d] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(customLabJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(customLabFaqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "MIRAI Custom Lab", path: "/custom-lab" },
          ])),
        }}
      />
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
                <span className="block text-[clamp(2.45rem,6.5vw,4.75rem)]">Crea la tua </span>
                <span className="block bg-gradient-to-r from-[#c7b8ff] via-primary to-[#d54dff] bg-clip-text text-[clamp(2.45rem,6.5vw,4.75rem)] text-transparent drop-shadow-[0_0_24px_rgba(145,90,255,0.2)]">T-shirt online.</span>
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

      <section className="border-b border-white/10 bg-[#0b0910] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">MIRAI Custom Lab</p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-[-0.035em] sm:text-4xl">
            T-shirt personalizzate online: domande frequenti
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/50">
            Un servizio di customizzazione pensato per creare un pezzo streetwear personale, non una stampa anonima in grandi quantità.
          </p>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {FAQS.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white marker:hidden sm:text-base">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">{item.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/guide/come-personalizzare-t-shirt" className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-white">
            Leggi la guida alla personalizzazione <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
