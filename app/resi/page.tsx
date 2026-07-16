import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Resi e Rimborsi - MIRAI",
  description: "Politica di reso e rimborso per gli acquisti effettuati su MIRAI.",
}

export default function ResiPage() {
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
            Resi e Rimborsi
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl text-pretty">
            La tua soddisfazione e la nostra priorita. Se non sei soddisfatto del tuo acquisto, puoi restituirlo facilmente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Clock, title: "14 Giorni", desc: "Tempo per richiedere il reso dalla data di consegna" },
              { icon: RotateCcw, title: "Reso Gratuito", desc: "Le spese di restituzione sono a carico di MIRAI per l'Italia" },
              { icon: CheckCircle, title: "Rimborso Rapido", desc: "Entro 7 giorni lavorativi dalla ricezione del reso" },
            ].map((item) => (
              <div key={item.title} className="border border-border rounded-lg p-6 bg-card text-center flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-border mb-16" />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Come Effettuare un Reso
              </h2>
              <ol className="flex flex-col gap-3">
                {[
                  "Contattaci entro 14 giorni dalla ricezione a info@mirai.store indicando il numero d'ordine.",
                  "Riceverai un'email con le istruzioni e l'etichetta di reso prepagata.",
                  "Imballa il prodotto nell'imballaggio originale o in una confezione adeguata.",
                  "Consegna il pacco al punto di ritiro o al corriere indicato.",
                  "Una volta ricevuto e verificato il reso, procederemo al rimborso.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4 text-muted-foreground leading-relaxed">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Condizioni di Reso
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border rounded-lg p-6 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">Accettati</h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {["Prodotti non utilizzati e con etichette originali", "Prodotti nella confezione originale", "Prodotti senza segni di usura o danni", "Prodotti difettosi o non conformi"].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-border rounded-lg p-6 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">Non Accettati</h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {["Prodotti personalizzati o customizzati", "Prodotti lavati o indossati", "Prodotti senza etichette originali", "Resi dopo 14 giorni dalla consegna"].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Rimborsi
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Il rimborso viene elaborato sullo stesso metodo di pagamento utilizzato per l{"'"}acquisto entro 7 giorni lavorativi dalla verifica del reso. Riceverai una conferma via email. Per qualsiasi domanda, contattaci a{" "}
                <Link href="/contatti" className="text-primary hover:underline">info@mirai.store</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
