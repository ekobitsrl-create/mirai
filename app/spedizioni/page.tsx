import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Truck, Clock, Globe, Package } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { formatShippingPrice, SHIPPING_CONFIG } from "@/lib/shipping"

export const metadata: Metadata = {
  title: "Spedizioni - MIRAI",
  description: "Informazioni su spedizioni, tempi di consegna e costi per gli ordini MIRAI.",
}

export default function SpedizioniPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Torna alla Home
          </Link>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
            Spedizioni
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl text-pretty">
            Tutte le informazioni relative alle spedizioni dei nostri prodotti. Lavoriamo con i migliori corrieri per garantire consegne rapide e sicure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { icon: Truck, title: "Spedizione Standard", value: "3-5 giorni lavorativi", desc: "Sempre gratuita, senza importo minimo" },
              { icon: Clock, title: "Spedizione Express", value: "1-2 giorni lavorativi", desc: `Costo di ${formatShippingPrice(SHIPPING_CONFIG.expressPriceCents)}` },
              { icon: Globe, title: "Destinazioni Europee", value: "UE, Regno Unito e Svizzera", desc: "Stesse tariffe e tempistiche indicate sopra" },
              { icon: Package, title: "Ritiro in MIRAI LAB STORE", value: "Disponibile a breve", desc: "Ritira gratuitamente nel nostro MIRAI LAB STORE di Catania" },
            ].map((item) => (
              <div key={item.title} className="border border-border rounded-lg p-6 bg-card flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-primary mb-1">{item.title}</h3>
                  <p className="text-foreground font-medium">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-border mb-16" />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Tracciamento Ordine
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Dopo la spedizione del tuo ordine, riceverai un{"'"}email con il codice di tracciamento. Potrai monitorare lo stato della consegna direttamente dal sito del corriere. I codici di tracciamento vengono attivati entro 24 ore dalla spedizione.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Zone di Consegna
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Spediamo in tutta Italia, in tutti i Paesi dell'Unione Europea, nel Regno Unito e in Svizzera. Per Regno Unito e Svizzera potrebbero essere applicati dazi doganali a carico del destinatario. Per altre destinazioni, contattaci a{" "}
                <Link href="/contatti" className="text-primary hover:underline">info@mirai.store</Link>.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Imballaggio
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ogni ordine viene confezionato con cura in packaging brandizzato MIRAI, pensato per garantire la protezione del prodotto e un{"'"}esperienza di unboxing premium. Utilizziamo materiali riciclabili e a basso impatto ambientale.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
