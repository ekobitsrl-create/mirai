import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, Mail, RotateCcw, XCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "Resi e Rimborsi - MIRAI",
  alternates: { canonical: "/resi" },
  description: "Resi gratuiti in Italia entro 30 giorni dalla consegna, con etichetta prepagata e nessun costo di restocking.",
}

const returnSteps = [
  `Scrivi entro 30 giorni di calendario dalla consegna a ${COMPANY_INFO.email} indicando numero ordine, email usata per l'acquisto e articoli da restituire.`,
  "Quando il reso è approvato, MIRAI sostiene le spese di restituzione e invia un'etichetta prepagata con le istruzioni di rientro.",
  "Imballa il prodotto in modo sicuro, preferibilmente nella confezione originale, con cartellini ed eventuali accessori.",
  "Consegna il pacco al corriere o al punto di consegna indicato nelle istruzioni: il reso avviene per posta tramite spedizione tracciata.",
  "Dopo ricezione e verifica, il rimborso viene emesso entro 14 giorni sullo stesso metodo di pagamento usato dal cliente al checkout.",
]

const policyFacts = [
  { label: "Paese", value: "Italia (IT)" },
  { label: "Valuta", value: "Euro (EUR)" },
  { label: "Finestra di reso", value: "30 giorni di calendario dalla consegna" },
  { label: "Metodo", value: "Per posta, con consegna al corriere o al punto indicato" },
  { label: "Costo del reso", value: "Gratuito: spese a carico di MIRAI" },
  { label: "Costo di restocking", value: "Nessuno (0,00 EUR)" },
]

const accepted = [
  "Prodotti non utilizzati, non lavati e non danneggiati",
  "Cartellini originali, confezione e accessori presenti",
  "Richiesta inviata entro 30 giorni dalla data di consegna",
  "Prodotti difettosi o non conformi segnalati appena rilevati",
]

const refused = [
  "Prodotti personalizzati o customizzati, salvo difetto o non conformita",
  "Prodotti indossati, lavati, alterati o privi di cartellini",
  "Resi inviati senza approvazione o oltre il termine indicato",
  "Danni causati da uso improprio, lavaggio errato o normale usura",
]

export default function ResiPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">Politica di reso MIRAI</p>
          <h1 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Resi e Rimborsi
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-muted-foreground text-pretty">
            Questa politica si applica agli ordini MIRAI consegnati in Italia e riassume tempi, metodo di reso, costi e modalità di rimborso.
          </p>

          <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Clock, title: "30 giorni", desc: "Puoi richiedere il reso dalla data di consegna." },
              { icon: RotateCcw, title: "Spese a carico MIRAI", desc: "Etichetta prepagata per ogni reso approvato." },
              { icon: CheckCircle, title: "Rimborso entro 14 giorni", desc: "Sullo stesso metodo di pagamento usato al checkout." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-16 h-px bg-border" />

          <div className="flex flex-col gap-10 text-muted-foreground">
            <section className="flex flex-col gap-5" aria-labelledby="riepilogo-policy-resi">
              <div>
                <h2 id="riepilogo-policy-resi" className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                  Riepilogo della politica di reso
                </h2>
                <p className="mt-2 leading-relaxed">
                  Accettiamo resi sia per ripensamento sia per prodotti difettosi o non conformi, nel rispetto delle condizioni indicate qui sotto.
                </p>
              </div>
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {policyFacts.map((fact) => (
                  <div key={fact.label} className="bg-card p-5">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{fact.label}</dt>
                    <dd className="mt-2 text-sm leading-6 text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-muted-foreground">Ultimo aggiornamento: 9 agosto 2026.</p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Come effettuare un reso
              </h2>
              <ol className="flex flex-col gap-3">
                {returnSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-4 leading-relaxed">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Resi accettati</h2>
                </div>
                <ul className="flex flex-col gap-2">
                  {accepted.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Resi non accettati</h2>
                </div>
                <ul className="flex flex-col gap-2">
                  {refused.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Costi di restituzione
              </h2>
              <p className="leading-relaxed">
                Per ogni reso approvato in Italia, MIRAI sostiene integralmente le spese di restituzione e invia un'etichetta prepagata. Il costo per il cliente è 0,00 EUR e non viene detratto alcun importo dal rimborso. Non spedire il prodotto prima di aver ricevuto le istruzioni via email.
              </p>
              <p className="leading-relaxed">
                MIRAI non applica costi di reintegro magazzino o restocking fee: il costo è 0,00 EUR.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Rimborsi
              </h2>
              <p className="leading-relaxed">
                Dopo aver ricevuto e controllato il prodotto, emettiamo il rimborso entro 14 giorni sullo stesso metodo di pagamento usato dal cliente al checkout. I tempi di accredito effettivi dipendono dal circuito di pagamento o dalla banca.
              </p>
            </section>

            <section className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Contatto resi</h2>
                  <p className="mt-2 text-sm leading-6">
                    Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">{COMPANY_INFO.email}</a>. Indica sempre il numero d'ordine, l'email usata al checkout e il motivo della richiesta.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
