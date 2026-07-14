import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Chi Siamo - MIRAI",
  description:
    "MIRAI: il futuro dello streetwear. Un progetto innovativo nato a Catania che fonde moda, tecnologia e cultura urbana.",
}

export default function ChiSiamoPage() {
  return (
    <>
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center">
          <div className="relative w-full max-w-4xl mx-auto">
            <Image
              src="/images/store-interior.png"
              alt="Lo spazio MIRAI - Interno del negozio streetwear"
              width={1024}
              height={1365}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="max-w-4xl mx-auto w-full px-6 py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Home
            </Link>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              Chi Siamo
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col gap-12">

            {/* Introduzione */}
            <div className="flex flex-col gap-4">
              <p className="text-lg md:text-xl leading-relaxed text-foreground text-pretty">
                {"\u004DIR\u039BI \u00e8 un progetto di impresa innovativo nato a Catania con l\u2019obiettivo di rivoluzionare il settore dello streetwear attraverso una fusione tra moda, tecnologia e cultura urbana."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {"Il brand prende il nome dal termine giapponese \u201cMirai\u201d (\u672a\u6765), che significa \u201cfuturo\u201d: un simbolo di evoluzione, visione e avanguardia."}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Filosofia del Brand */}
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Filosofia del Brand
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {"MIR\u039BI rappresenta una nuova generazione di brand streetwear. L\u2019identit\u00e0 del marchio si fonda su tre principi:"}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "Innovazione", desc: "Tecnologia e AI al servizio della creativit\u00e0." },
                  { title: "Autenticit\u00e0", desc: "Cultura urbana genuina, senza compromessi." },
                  { title: "Design", desc: "Estetica urban-futuristica, minimal ma potente." },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="border border-border rounded-lg p-5 bg-card"
                  >
                    <h3 className="text-sm font-bold tracking-widest uppercase text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                {"Ogni collezione riflette un\u2019estetica urban-futuristica, capace di esprimere individualit\u00e0 e appartenenza a una cultura moderna e creativa."}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Concept del Negozio */}
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Concept del Negozio
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Il progetto prevede la realizzazione di uno spazio fisico a Catania, concepito come un concept store streetwear futuristico con area shooting integrata e postazione per la customizzazione dei capi."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {"All\u2019interno verr\u00e0 sviluppato un software basato su intelligenza artificiale capace di generare design e contenuti digitali, potenziando la creativit\u00e0 del team e migliorando l\u2019esperienza cliente."}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { title: "Vendita Diretta", desc: "Abbigliamento streetwear selezionato e curato." },
                  { title: "Personalizzazione", desc: "Corner di personalizzazione manuale dei prodotti." },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="border border-border rounded-lg p-5 bg-card"
                  >
                    <h3 className="text-sm font-bold tracking-widest uppercase text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Team */}
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Il Team
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  { name: "Christian Scrivano", role: "Founder & Creative Director" },
                  { name: "Social Media Manager", role: "Gestione contenuti, marketing e comunicazione" },
                  { name: "Addetto alla Customizzazione", role: "Personalizzazione capi e supporto in store" },
                ].map((member) => (
                  <li
                    key={member.name}
                    className="flex items-center gap-4 border border-border rounded-lg p-4 bg-card"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Identità Visiva */}
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {"Identit\u00e0 Visiva"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Palette: nero, bianco, argento. Il logo MIR\u039BI presenta la \u201c\u039b\u201d come simbolo di innovazione e progresso. Stile grafico urban-futuristico, linee pulite e materiali metallici."}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="h-12 w-12 rounded-lg bg-[#111111]" title="Nero" />
                <div className="h-12 w-12 rounded-lg bg-[#ffffff] border border-border" title="Bianco" />
                <div className="h-12 w-12 rounded-lg bg-[#c0c0c0]" title="Argento" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Vision e Sviluppo Futuro */}
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Vision e Sviluppo Futuro
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {"MIR\u039BI mira a espandersi a livello nazionale e internazionale attraverso:"}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Creazione di uno store online interattivo",
                  "Sviluppo di una piattaforma AI per designer e clienti",
                  "Collaborazioni con artisti locali e internazionali",
                  "Implementazione di processi sostenibili e digitalizzati",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Conclusione */}
            <div className="flex flex-col gap-4">
              <blockquote className="border-l-2 border-primary pl-6 py-2">
                <p className="text-lg md:text-xl text-foreground italic leading-relaxed text-pretty">
                  {"\"MIR\u039BI nasce per rivoluzionare lo streetwear italiano partendo da Catania, unendo creativit\u00e0, tecnologia e cultura urbana.\""}
                </p>
              </blockquote>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                {"Christian Scrivano \u2014 Founder & Creative Director"}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground font-medium tracking-wide text-sm uppercase rounded-lg hover:bg-primary/90 transition-colors"
              >
                Scopri la Collezione
              </Link>
              <Link
                href="/#newsletter"
                className="inline-flex items-center justify-center h-12 px-8 border border-border text-foreground font-medium tracking-wide text-sm uppercase rounded-lg hover:bg-secondary transition-colors"
              >
                Resta Aggiornato
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
