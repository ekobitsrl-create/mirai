import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { formatShippingPrice, SHIPPING_CONFIG } from "@/lib/shipping"

export const metadata: Metadata = {
  title: "FAQ - MIRAI",
  description: "Domande frequenti sugli acquisti, spedizioni, resi e molto altro su MIRAI.",
}

const faqs = [
  {
    category: "Ordini e Pagamenti",
    questions: [
      {
        q: "Quali metodi di pagamento accettate?",
        a: "Accettiamo Visa, Mastercard, PayPal, Apple Pay e Google Pay. Tutti i pagamenti sono processati in modo sicuro tramite Stripe.",
      },
      {
        q: "Posso modificare o annullare un ordine?",
        a: "Puoi richiedere la modifica o l'annullamento entro 2 ore dall'ordine scrivendo a info@mirai.store. Una volta spedito, l'ordine non puo essere annullato ma puoi effettuare un reso.",
      },
      {
        q: "Ricevero una conferma dell'ordine?",
        a: "Si, riceverai un'email di conferma con il riepilogo dell'ordine e successivamente un'email con il codice di tracciamento della spedizione.",
      },
    ],
  },
  {
    category: "Spedizioni",
    questions: [
      {
        q: "Quanto costa la spedizione?",
        a: `La spedizione standard è sempre gratuita, senza importo minimo. La spedizione express costa ${formatShippingPrice(SHIPPING_CONFIG.expressPriceCents)}.`,
      },
      {
        q: "In quanto tempo ricevero il mio ordine?",
        a: "In tutte le destinazioni supportate, la spedizione standard richiede 3-5 giorni lavorativi e quella express 1-2 giorni lavorativi.",
      },
      {
        q: "Spedite all'estero?",
        a: "Sì, spediamo in tutti i Paesi dell'Unione Europea, nel Regno Unito e in Svizzera. Per altre destinazioni, contattaci per verificare disponibilità e costi.",
      },
    ],
  },
  {
    category: "Resi e Rimborsi",
    questions: [
      {
        q: "Posso restituire un prodotto?",
        a: "Si, hai 14 giorni dalla ricezione per richiedere il reso. Il prodotto deve essere nelle condizioni originali, non indossato e con le etichette. Consulta la nostra pagina Resi e Rimborsi per i dettagli.",
      },
      {
        q: "Il reso e gratuito?",
        a: "Si, le spese di restituzione sono a carico di MIRAI per ordini spediti in Italia. Per resi internazionali, le spese possono variare.",
      },
      {
        q: "Quanto tempo ci vuole per il rimborso?",
        a: "Il rimborso viene elaborato entro 7 giorni lavorativi dalla ricezione e verifica del reso, sullo stesso metodo di pagamento utilizzato per l'acquisto.",
      },
    ],
  },
  {
    category: "Prodotti e Taglie",
    questions: [
      {
        q: "Come scelgo la taglia giusta?",
        a: "Ogni prodotto ha una guida taglie nella pagina di dettaglio. In generale, i nostri capi vestono regolari. In caso di dubbio, contattaci e ti aiuteremo nella scelta.",
      },
      {
        q: "I colori dei prodotti sono fedeli alle foto?",
        a: "Facciamo del nostro meglio per rappresentare fedelmente i colori. Leggere variazioni possono dipendere dalle impostazioni del tuo schermo.",
      },
      {
        q: "Posso personalizzare un capo?",
        a: "Sì, nel nostro MIRAI LAB STORE di Catania offriamo un servizio di personalizzazione. Per il servizio online, contattaci per verificare le opzioni disponibili.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Domande Frequenti
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl text-pretty">
            Trova le risposte alle domande piu comuni. Se non trovi quello che cerchi, non esitare a{" "}
            <Link href="/contatti" className="text-primary hover:underline">contattarci</Link>.
          </p>

          <div className="flex flex-col gap-12">
            {faqs.map((section) => (
              <div key={section.category} className="flex flex-col gap-4">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                  {section.category}
                </h2>
                <div className="flex flex-col gap-3">
                  {section.questions.map((faq, i) => (
                    <details key={i} className="group border border-border rounded-lg bg-card overflow-hidden">
                      <summary className="flex items-center justify-between p-5 cursor-pointer text-foreground font-medium text-sm hover:text-primary transition-colors list-none">
                        {faq.q}
                        <span className="text-muted-foreground group-open:rotate-180 transition-transform ml-4 shrink-0">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-border my-16" />

          <div className="flex flex-col gap-4 items-center text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
              Non hai trovato la risposta?
            </h2>
            <p className="text-muted-foreground mb-4">
              Il nostro team e pronto ad aiutarti per qualsiasi dubbio o necessita.
            </p>
            <Link href="/contatti" className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground font-medium tracking-wide text-sm uppercase rounded-lg hover:bg-primary/90 transition-colors">
              Contattaci
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
