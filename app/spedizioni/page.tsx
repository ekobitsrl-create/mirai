import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock, Globe, MapPin, Package, Truck } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { formatShippingPrice, SHIPPING_CONFIG } from "@/lib/shipping"

export const metadata: Metadata = {
  title: "Spedizioni - MIRAI",
  alternates: { canonical: "/spedizioni" },
  description: "Informazioni su spedizioni, tempi di consegna e costi per gli ordini MIRAI.",
}

export default function SpedizioniPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">Tempi e costi chiari</p>
          <h1 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            Spedizioni
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-muted-foreground text-pretty">
            Gli ordini vengono preparati in Italia e spediti con corriere tracciato. I costi mostrati qui devono corrispondere a checkout e Merchant Center.
          </p>

          <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { icon: Truck, title: "Standard", value: "3-5 giorni lavorativi", desc: "Sempre gratuita, senza importo minimo" },
              { icon: Clock, title: "Express", value: "1-2 giorni lavorativi", desc: `Costo di ${formatShippingPrice(SHIPPING_CONFIG.expressPriceCents)}` },
              { icon: Globe, title: "Destinazioni", value: "Italia, UE, Regno Unito e Svizzera", desc: "Eventuali dazi extra UE restano a carico del destinatario" },
              { icon: MapPin, title: "Origine ordine", value: "Catania, Italia", desc: "Preparazione e dispatch dal team MIRAI" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg border border-border bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">{item.title}</h2>
                  <p className="font-medium text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-16 h-px bg-border" />

          <div className="flex flex-col gap-8 text-muted-foreground">
            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Preparazione e consegna
              </h2>
              <p className="leading-relaxed">
                Gli ordini vengono normalmente preparati entro 1-2 giorni lavorativi dalla conferma del pagamento. I tempi di consegna indicati si calcolano dalla presa in carico del corriere e possono variare in periodi di picco, festivita o cause non dipendenti da MIRAI.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Tracciamento ordine
              </h2>
              <p className="leading-relaxed">
                Dopo la spedizione riceverai un'email con il codice di tracciamento. Il tracking puo richiedere fino a 24 ore per aggiornarsi sul sito del corriere.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                Dazi, indirizzi e mancata consegna
              </h2>
              <p className="leading-relaxed">
                Per Regno Unito, Svizzera e altre spedizioni extra UE possono essere applicati dazi o oneri doganali a carico del destinatario. Verifica sempre l'indirizzo prima del pagamento: eventuali costi per giacenza, riconsegna o rientro causati da dati errati possono essere addebitati al cliente.
              </p>
            </section>

            <section className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Package className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Imballaggio</h2>
                  <p className="mt-2 text-sm leading-6">
                    Ogni ordine viene imballato con cura per proteggere il prodotto durante il trasporto. Per informazioni su resi e rimborsi consulta la pagina <Link href="/resi" className="text-primary hover:underline">Resi e Rimborsi</Link>.
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
