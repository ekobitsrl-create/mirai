import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail, MapPin, Clock, Phone } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Contatti - MIRAI",
  alternates: { canonical: "/contatti" },
  description: "Contattaci per qualsiasi informazione. Il team MIRAI e sempre disponibile.",
}

export default function ContattiPage() {
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
            Contatti
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl text-pretty">
            Hai domande, suggerimenti o vuoi collaborare con noi? Siamo sempre disponibili ad ascoltarti.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              { icon: Mail, title: "Email", value: "mirailabstore@gmail.com", desc: "Rispondiamo entro 24 ore lavorative" },
              { icon: Phone, title: "WhatsApp", value: "+39 349 866 3584", desc: "Lun - Ven, 10:00 - 18:00" },
              { icon: MapPin, title: "Indirizzo", value: "Catania, Sicilia", desc: "Il nostro MIRAI LAB STORE aprirà presto" },
              { icon: Clock, title: "Orari Supporto", value: "Lun - Ven", desc: "10:00 - 13:00 / 15:00 - 18:00" },
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

          <div className="flex flex-col gap-6">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Scrivici un Messaggio
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Compila il form qui sotto e ti risponderemo il prima possibile. Per ordini esistenti, includi il numero d{"'"}ordine nel messaggio.
            </p>
            <form className="flex flex-col gap-4 max-w-lg">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Nome</label>
                <input type="text" className="h-11 px-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Il tuo nome" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Email</label>
                <input type="email" className="h-11 px-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="la-tua@email.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Messaggio</label>
                <textarea rows={5} className="px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Come possiamo aiutarti?" />
              </div>
              <button type="button" className="h-12 px-8 bg-primary text-primary-foreground font-medium tracking-wide text-sm uppercase rounded-lg hover:bg-primary/90 transition-colors self-start">
                Invia Messaggio
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
