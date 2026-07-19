import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Termini e Condizioni - MIRAI",
  alternates: { canonical: "/termini" },
  description: "Termini e condizioni generali di vendita per gli acquisti su MIRAI.",
}

export default function TerminiPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="mb-2 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Termini e Condizioni
          </h1>
          <p className="mb-12 text-sm text-muted-foreground">Ultimo aggiornamento: 18 luglio 2026</p>

          <div className="flex flex-col gap-10 text-muted-foreground leading-relaxed">
            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">1. Venditore</h2>
              <p>Le presenti condizioni regolano gli acquisti su mirailabstore.com, gestito da MIRAI LAB STORE DI SCRIVANO CHRISTIAN, P. IVA 06287920877, CF SCRCRS99C11C351W, REA CT - 486994, con sede operativa in Via Umberto 95, 95129 Catania (CT), Italia.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">2. Prodotti, prezzi e disponibilita</h2>
              <p>I prodotti sono descritti nelle rispettive pagine con prezzo in Euro, IVA inclusa ove applicabile, immagini, taglie e disponibilita. MIRAI puo aggiornare prezzi e disponibilita prima della conferma dell'ordine. Le immagini possono variare leggermente per impostazioni dello schermo o produzione artigianale.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">3. Ordini e pagamenti</h2>
              <p>L'ordine inviato dal cliente costituisce proposta di acquisto. Il contratto si conclude con la conferma dell'ordine. I pagamenti online sono gestiti tramite Stripe e possono includere carte, PayPal, Apple Pay, Google Pay, Klarna o Scalapay quando disponibili per l'ordine. Per le consegne in Italia puo essere disponibile il pagamento in contrassegno. Il checkout avviene su connessione sicura.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">4. Spedizioni</h2>
              <p>Costi, tempi, origine degli ordini, tracking e destinazioni sono indicati nella pagina <Link href="/spedizioni" className="text-primary hover:underline">Spedizioni</Link>. Le informazioni mostrate al checkout prevalgono se aggiornate in tempo reale prima del pagamento.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">5. Resi, recesso e rimborsi</h2>
              <p>Il cliente consumatore puo richiedere il reso entro 14 giorni dalla consegna, salvo esclusioni previste dalla legge e per prodotti personalizzati, se non difettosi o non conformi. Metodo, costi e tempi di rimborso sono indicati nella pagina separata <Link href="/resi" className="text-primary hover:underline">Resi e Rimborsi</Link>.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">6. Garanzia legale</h2>
              <p>I prodotti venduti a consumatori sono coperti dalla garanzia legale di conformita prevista dal Codice del Consumo. In caso di difetto o non conformita, contatta MIRAI con numero ordine, descrizione del problema e foto del prodotto.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">7. Prodotti personalizzati</h2>
              <p>I capi custom o personalizzati sono realizzati su richiesta del cliente. Non possono essere restituiti per semplice ripensamento, salvo difetto, errore imputabile a MIRAI o non conformita rispetto all'ordine confermato.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">8. Privacy e cookie</h2>
              <p>Il trattamento dei dati personali e descritto nella <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. L'uso dei cookie e descritto nella <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">9. Legge applicabile e foro</h2>
              <p>Le presenti condizioni sono regolate dalla legge italiana. Per i consumatori resta competente il foro del luogo di residenza o domicilio del consumatore, se previsto dalla normativa applicabile. Negli altri casi sara competente il Foro di Catania.</p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">10. Contatti</h2>
              <p>Per comunicazioni formali o reclami puoi scrivere a <span className="text-primary">mirailabstore@pec.it</span>. Per assistenza ordinaria puoi usare la pagina <Link href="/contatti" className="text-primary hover:underline">Contatti</Link> o scrivere a <span className="text-muted-foreground">info@mirailabstore.com</span>.</p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
