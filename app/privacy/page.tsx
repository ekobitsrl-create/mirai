import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "Privacy Policy - MIRAI",
  alternates: { canonical: "/privacy" },
  description: "Informativa sulla privacy e trattamento dei dati personali di MIRAI.",
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-12">Ultimo aggiornamento: 2 agosto 2026</p>

          <div className="flex flex-col gap-10 text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">1. Titolare del Trattamento</h2>
              <p>Il titolare del trattamento dei dati personali è {COMPANY_INFO.legalName}, con sede operativa in {COMPANY_INFO.address}. Il sito ufficiale è <a href={COMPANY_INFO.websiteUrl} className="text-primary hover:underline">{COMPANY_INFO.website}</a>. Per qualsiasi comunicazione relativa al trattamento dei tuoi dati personali, puoi contattarci a <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">{COMPANY_INFO.email}</a>.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">2. Dati Raccolti</h2>
              <p>Raccogliamo i seguenti dati personali:</p>
              <ul className="flex flex-col gap-2 pl-4">
                {["Dati identificativi: nome, cognome, indirizzo email", "Dati di contatto: indirizzo di spedizione, numero di telefono", "Dati di pagamento: elaborati tramite Stripe (non conserviamo dati delle carte)", "Dati di navigazione: indirizzo IP, tipo di browser, pagine visitate, cookie tecnici", "Dati dell'account: credenziali di accesso (password criptata)", "Dati del carrello: articoli, quantita e preferenze, usati per i promemoria solo con consenso"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">3. Finalita del Trattamento</h2>
              <p>I tuoi dati vengono trattati per le seguenti finalita:</p>
              <ul className="flex flex-col gap-2 pl-4">
                {["Evasione degli ordini e gestione delle spedizioni", "Gestione dell'account utente e recupero password", "Comunicazioni relative agli ordini (conferme, pagamenti, stato e assistenza)", "Promemoria del carrello e comunicazioni commerciali (solo con consenso esplicito)", "Adempimento di obblighi legali e fiscali", "Miglioramento del servizio e analisi statistiche anonimizzate"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">4. Base Giuridica</h2>
              <p>Il trattamento dei dati si basa su: esecuzione del contratto (acquisto prodotti), consenso (newsletter, cookie non tecnici), obbligo legale (fatturazione), legittimo interesse (miglioramento del servizio, prevenzione frodi).</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">5. Conservazione dei Dati</h2>
              <p>I dati personali vengono conservati per il tempo necessario alle finalita per cui sono stati raccolti. I dati relativi agli ordini vengono conservati per 10 anni per obblighi fiscali. I dati dell'account vengono eliminati su richiesta dell'utente. I promemoria del carrello vengono inviati una sola volta e possono essere disattivati in ogni momento tramite il link presente nell'email.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">6. Condivisione con Terze Parti</h2>
              <p>I tuoi dati possono essere condivisi con: Stripe (elaborazione pagamenti), corrieri (spedizioni), Supabase (hosting database e autenticazione), Resend (invio delle email transazionali e, con consenso, di promemoria, novita e offerte), Vercel (hosting sito web) e strumenti di analytics e advertising come Google Analytics/Google Tag Manager/Google Ads, PostHog, TikTok Pixel e Meta Pixel, ove attivi e previo consenso ove richiesto. PostHog viene usato per analytics, autocapture, replay delle sessioni e mappe di calore; gli input sono mascherati nelle registrazioni. Non vendiamo o cediamo i tuoi dati a terzi per finalita di marketing.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">7. I Tuoi Diritti</h2>
              <p>In conformita al GDPR (Regolamento UE 2016/679), hai diritto di:</p>
              <ul className="flex flex-col gap-2 pl-4">
                {["Accedere ai tuoi dati personali", "Rettificare dati inesatti o incompleti", "Cancellare i tuoi dati (diritto all'oblio)", "Limitare il trattamento", "Portare i tuoi dati (portabilita)", "Opporti al trattamento", "Revocare il consenso in qualsiasi momento"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>Per esercitare i tuoi diritti, scrivi a <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">{COMPANY_INFO.email}</a>. Puoi inoltre presentare reclamo al Garante per la Protezione dei Dati Personali.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">8. Cookie</h2>
              <p>Per informazioni sui cookie utilizzati, consulta la nostra <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
