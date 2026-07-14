"use client"

import Link from "next/link"
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Pagina di annullamento pagamento
 * Mostrata quando l'utente annulla il checkout su Stripe
 */
export default function CancelPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icona annullamento */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl" />
            <div className="relative bg-orange-500/10 rounded-full p-6">
              <XCircle className="h-16 w-16 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Titolo */}
        <h1 
          className="text-3xl font-bold text-foreground mb-4"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Pagamento Annullato
        </h1>

        {/* Messaggio */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Il pagamento è stato annullato. Non ti è stato addebitato nulla. 
          Il tuo carrello è ancora disponibile se desideri completare l&apos;acquisto.
        </p>

        {/* Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground">
            Se hai riscontrato problemi durante il pagamento o hai domande, 
            non esitare a contattarci. Siamo qui per aiutarti!
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/checkout">
            <Button className="w-full" size="lg">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Torna al Carrello
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
