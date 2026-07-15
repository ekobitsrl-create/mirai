import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Termini e Condizioni - MIRAI",
  description: "Termini e condizioni generali di vendita per gli acquisti su MIRAI.",
}

export default function TerminiPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2 text-balance">
            Termini e Condizioni
          </h1>
          <p className="text-sm text-muted-foreground mb-12">Ultimo aggiornamento: 20 febbraio 2026</p>

          <div className="flex flex-col gap-10 text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">1. Premessa</h2>
              <p>Le presenti Condizioni Generali di Vendita regolano l{"'"}acquisto di prodotti effettuato tramite il sito web mirai.store, di proprieta di MIRAI di Christian Scrivano, con sede a Catania (CT), Italia. L{"'"}acquisto sul sito comporta l{"'"}accettazione integrale delle presenti condizioni.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">2. Prodotti</h2>
              <p>I prodotti in vendita su mirai.store sono descritti e presentati con la maggiore accuratezza possibile. Tuttavia, le immagini e i colori dei prodotti potrebbero non essere perfettamente rappresentativi delle caratteristiche reali a causa delle impostazioni dei dispositivi utilizzati. MIRAI si riserva il diritto di modificare i prezzi e la disponibilita dei prodotti in qualsiasi momento.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">3. Ordini e Pagamenti</h2>
              <p>L{"'"}ordine costituisce una proposta di acquisto da parte dell{"'"}utente. MIRAI si riserva il diritto di accettare o rifiutare qualsiasi ordine. I pagamenti vengono elaborati in modo sicuro tramite Stripe. Accettiamo: Visa, Mastercard, PayPal, Apple Pay, Google Pay. I prezzi sono indicati in Euro e includono l{"'"}IVA.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">4. Spedizioni e Consegne</h2>
              <p>Le modalita di spedizione e i relativi costi sono indicati nella pagina <Link href="/spedizioni" className="text-primary hover:underline">Spedizioni</Link>. I tempi di consegna sono indicativi e non costituiscono termine essenziale. MIRAI non e responsabile per ritardi causati da corrieri o eventi di forza maggiore.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">5. Diritto di Recesso</h2>
              <p>In conformita al Codice del Consumo (D.Lgs. 206/2005), hai diritto di recedere dall{"'"}acquisto entro 14 giorni dalla ricezione del prodotto, senza doverne indicare il motivo. Per esercitare il diritto di recesso, consulta la pagina <Link href="/resi" className="text-primary hover:underline">Resi e Rimborsi</Link>.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">6. Garanzia Legale</h2>
              <p>Tutti i prodotti venduti su mirai.store sono coperti dalla garanzia legale di conformita prevista dal Codice del Consumo (artt. 128-135 D.Lgs. 206/2005). In caso di prodotto difettoso o non conforme, hai diritto alla riparazione, sostituzione o rimborso. La garanzia ha durata di 24 mesi dalla consegna.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">7. Proprieta Intellettuale</h2>
              <p>Tutti i contenuti del sito (testi, immagini, loghi, grafiche, software) sono di proprieta di MIRAI e protetti dalla normativa sul diritto d{"'"}autore e sulla proprieta industriale. E vietata qualsiasi riproduzione, distribuzione o utilizzo non autorizzato.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">8. Limitazione di Responsabilita</h2>
              <p>MIRAI non e responsabile per danni diretti o indiretti derivanti dall{"'"}uso o dall{"'"}impossibilita di utilizzare il sito. MIRAI non garantisce che il sito sia privo di errori o interruzioni, pur impegnandosi a mantenerlo sempre funzionante.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">9. Privacy</h2>
              <p>Per informazioni sul trattamento dei dati personali, consulta la nostra <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">10. Legge Applicabile e Foro Competente</h2>
              <p>Le presenti condizioni sono regolate dalla legge italiana. Per qualsiasi controversia relativa all{"'"}interpretazione o esecuzione delle presenti condizioni, sara competente in via esclusiva il Foro di Catania, salvo quanto previsto dall{"'"}art. 66-bis del Codice del Consumo.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-foreground">11. Contatti</h2>
              <p>Per qualsiasi informazione o reclamo, puoi contattarci a <span className="text-primary">info@mirai.store</span> o visitare la pagina <Link href="/contatti" className="text-primary hover:underline">Contatti</Link>.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
