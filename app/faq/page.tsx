import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "FAQ - MIRAI",
  description: "Domande frequenti sugli acquisti, spedizioni, resi e molto altro su MIRAI.",
  alternates: { canonical: "/faq" },
}

const faqs = [
  {
    category: "Ordini e Pagamenti",
    questions: [
      {
        q: "Quali metodi di pagamento accettate?",
        a: "Accettiamo Visa, Mastercard, Postepay, PayPal, Apple Pay e Google Pay. Klarna e Scalapay sono disponibili quando l'ordine e il cliente rispettano i requisiti mostrati da Stripe. Per le consegne in Italia puoi scegliere anche il contrassegno, con un supplemento fisso di 9 €. Tutti i pagamenti online sono processati in modo sicuro tramite Stripe.",
      },
      {
        q: "Posso modificare o annullare un ordine?",
        a: `Puoi richiedere la modifica o l'annullamento entro 2 ore dall'ordine scrivendo a ${COMPANY_INFO.email}. Una volta spedito, l'ordine non puo essere annullato ma puoi effettuare un reso.`,
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
        a: "La spedizione è sempre gratuita in tutte le destinazioni supportate, senza importo minimo. Se scegli il contrassegno per una consegna in Italia viene applicato un supplemento fisso di 9 € relativo al metodo di pagamento, non alla spedizione.",
      },
      {
        q: "In quanto tempo ricevero il mio ordine?",
        a: "Dipende dal prodotto: la consegna stimata è di 3–5 giorni lavorativi per gli articoli standard e di 7–12 giorni lavorativi per gli articoli che riportano questa tempistica nella scheda. Il tempo applicabile è sempre indicato nella pagina prodotto.",
      },
      {
        q: "Spedite all'estero?",
        a: "Si, spediamo in tutti i Paesi dell'Unione Europea, nel Regno Unito e in Svizzera. Eventuali dazi o oneri doganali fuori dall'UE restano a carico del destinatario.",
      },
    ],
  },
  {
    category: "Resi e Rimborsi",
    questions: [
      {
        q: "Posso restituire un prodotto?",
        a: "Sì. Per gli ordini consegnati in Italia hai 30 giorni di calendario dalla consegna per richiedere il reso. Il prodotto deve essere nelle condizioni originali, non indossato e con i cartellini. Consulta la pagina Resi e Rimborsi per i dettagli.",
      },
      {
        q: "Il reso e gratuito?",
        a: "Sì. Per ogni reso approvato in Italia, MIRAI invia un'etichetta prepagata e sostiene integralmente le spese di restituzione. Il costo per il cliente è 0,00 EUR e non è prevista alcuna commissione di restocking.",
      },
      {
        q: "Come devo spedire il reso?",
        a: "Il reso avviene per posta tramite spedizione tracciata. Dopo l'approvazione riceverai l'etichetta prepagata e le istruzioni per consegnare il pacco al corriere o al punto di consegna indicato.",
      },
      {
        q: "Quanto tempo ci vuole per il rimborso?",
        a: "Il rimborso viene elaborato entro 3 giorni dal ricevimento del reso, sullo stesso metodo di pagamento utilizzato per l'acquisto. I tempi di accredito effettivi dipendono dal circuito di pagamento o dalla banca.",
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
        a: "Si, nel nostro MIRAI LAB STORE di Catania offriamo un servizio di personalizzazione. Per il servizio online, contattaci per verificare le opzioni disponibili.",
      },
    ],
  },
]

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((section) => section.questions).map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />
      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Domande Frequenti
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-muted-foreground text-pretty">
            Trova le risposte alle domande piu comuni. Se non trovi quello che cerchi, puoi <Link href="/contatti" className="text-primary hover:underline">contattarci</Link>.
          </p>

          <div className="flex flex-col gap-12">
            {faqs.map((section) => (
              <section key={section.category} className="flex flex-col gap-4">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                  {section.category}
                </h2>
                <div className="flex flex-col gap-3">
                  {section.questions.map((faq) => (
                    <details key={faq.q} className="group overflow-hidden rounded-lg border border-border bg-card">
                      <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-medium text-foreground transition-colors hover:text-primary">
                        {faq.q}
                        <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </summary>
                      <div className="border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="my-16 h-px bg-border" />

          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
              Non hai trovato la risposta?
            </h2>
            <p className="mb-4 text-muted-foreground">
              Il nostro team e pronto ad aiutarti per qualsiasi dubbio o necessita.
            </p>
            <Link href="/contatti" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90">
              Contattaci
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
