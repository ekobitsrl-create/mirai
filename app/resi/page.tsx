import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, Mail, RotateCcw, XCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Resi e Rimborsi - MIRAI",
  alternates: { canonical: "/resi" },
  description: "Politica di reso e rimborso per gli acquisti effettuati su MIRAI.",
}

const returnSteps = [
  "Scrivi entro 14 giorni dalla consegna a info@mirailabstore.com indicando numero ordine, email usata per l'acquisto e motivo del reso.",
  "Quando il reso e approvato, MIRAI sostiene le spese di spedizione e invia un'etichetta prepagata con le istruzioni di rientro.",
  "Imballa il prodotto in modo sicuro, preferibilmente nella confezione originale, con cartellini ed eventuali accessori.",
  "Consegna il pacco al corriere o al punto indicato nelle istruzioni di reso.",
  "Dopo ricezione e verifica, il rimborso viene emesso entro 14 giorni sullo stesso metodo di pagamento usato dal cliente al checkout.",
]

const accepted = [
  "Prodotti non utilizzati, non lavati e non danneggiati",
  "Cartellini originali, confezione e accessori presenti",
  "Richiesta inviata entro 14 giorni dalla data di consegna",
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

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">Policy separata e pubblica</p>
          <h1 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Resi e Rimborsi
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-muted-foreground text-pretty">
            Questa pagina e accessibile senza login e riassume tempi, metodo di reso, costi e modalita di rimborso per gli ordini MIRAI.
          </p>

          <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Clock, title: "14 giorni", desc: "Puoi richiedere il reso dalla data di consegna." },
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
                Per ogni reso approvato, MIRAI sostiene le spese di spedizione del reso e invia un'etichetta prepagata. Non spedire il prodotto prima di aver ricevuto le istruzioni via email.
              </p>
              <p className="leading-relaxed">
                MIRAI non applica costi di reintegro magazzino.
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
                    Email: <a href="mailto:info@mirailabstore.com" className="text-primary hover:underline">info@mirailabstore.com</a>. Indica sempre il numero d'ordine, l'email usata al checkout e il motivo della richiesta.
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
