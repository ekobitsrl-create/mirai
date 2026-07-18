import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Cookie Policy - MIRAI",
  description: "Informativa sui cookie utilizzati dal sito web MIRAI.",
}

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="mb-2 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Cookie Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12">Ultimo aggiornamento: 16 luglio 2026</p>

          <div className="flex flex-col gap-10 text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">Cosa Sono i Cookie</h2>
              <p>I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Servono a migliorare la tua esperienza di navigazione, ricordare le tue preferenze e analizzare il traffico del sito.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">Cookie Utilizzati</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 font-bold text-xs tracking-widest uppercase text-foreground">Tipo</th>
                      <th className="text-left p-4 font-bold text-xs tracking-widest uppercase text-foreground">Finalita</th>
                      <th className="text-left p-4 font-bold text-xs tracking-widest uppercase text-foreground">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tipo: "Tecnici (necessari)", finalita: "Funzionamento del sito, gestione della sessione, carrello acquisti", durata: "Sessione / 1 anno" },
                      { tipo: "Autenticazione", finalita: "Mantenimento dell'accesso all'account utente", durata: "30 giorni" },
                      { tipo: "Preferenze", finalita: "Salvataggio delle preferenze (cookie consent, lingua)", durata: "1 anno" },
                      { tipo: "Analitici", finalita: "Analisi anonimizzata del traffico tramite Vercel Analytics", durata: "Sessione" },
                      { tipo: "Marketing", finalita: "Misurazione delle campagne e delle conversioni tramite Google Tag Manager e TikTok Pixel, solo dopo il consenso", durata: "Secondo le impostazioni dei fornitori" },
                    ].map((row) => (
                      <tr key={row.tipo} className="border-b border-border last:border-0">
                        <td className="p-4 text-foreground font-medium">{row.tipo}</td>
                        <td className="p-4">{row.finalita}</td>
                        <td className="p-4">{row.durata}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">Cookie di Terze Parti</h2>
              <p>Il nostro sito potrebbe utilizzare servizi di terze parti che installano propri cookie:</p>
              <ul className="flex flex-col gap-2 pl-4">
                {[
                  "Stripe: per l'elaborazione sicura dei pagamenti",
                  "Vercel Analytics: per statistiche anonime sulle visite",
                  "Supabase: per la gestione dell'autenticazione",
                  "Google Tag Manager: per gestire i tag di misurazione e advertising, solo dopo il consenso",
                  "TikTok Pixel: per misurare visite, campagne e conversioni pubblicitarie, solo dopo il consenso",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">Gestione dei Cookie</h2>
              <p>Puoi gestire le tue preferenze sui cookie in qualsiasi momento attraverso il banner che appare alla tua prima visita. Inoltre, puoi modificare le impostazioni del tuo browser per bloccare o eliminare i cookie. Tieni presente che disabilitare i cookie tecnici potrebbe compromettere il funzionamento del sito.</p>
              <p>Di seguito le guide per i principali browser:</p>
              <ul className="flex flex-col gap-2 pl-4">
                {[
                  "Chrome: Impostazioni > Privacy e Sicurezza > Cookie",
                  "Firefox: Impostazioni > Privacy e Sicurezza > Cookie e Dati",
                  "Safari: Preferenze > Privacy > Gestisci Dati Siti Web",
                  "Edge: Impostazioni > Cookie e Autorizzazioni Sito",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">Aggiornamenti</h2>
              <p>La presente Cookie Policy puo essere aggiornata periodicamente. Ti invitiamo a consultarla regolarmente. Per qualsiasi domanda, contattaci a <span className="text-primary">mirailabstore@gmail.com</span> o visita la pagina <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
