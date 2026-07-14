"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Spinner } from "@/components/ui/spinner"

/**
 * Componente interno che usa useSearchParams
 * Deve essere avvolto in Suspense
 */
function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { clearCart } = useCart()

  // Svuota il carrello al caricamento della pagina
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icona successo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-green-500/10 rounded-full p-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
        </div>

        {/* Titolo */}
        <h1 
          className="text-3xl font-bold text-foreground mb-4"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Ordine Confermato!
        </h1>

        {/* Messaggio */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Grazie per il tuo acquisto! Riceverai una email di conferma con i dettagli 
          del tuo ordine e le informazioni per la spedizione.
        </p>

        {/* Info ordine */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium">Dettagli Spedizione</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Il tuo ordine verrà preparato e spedito entro 1-2 giorni lavorativi.
            Riceverai un&apos;email con il tracking non appena il pacco sarà partito.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground/60 mt-4 font-mono">
              ID Sessione: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/collezioni/abbigliamento">
            <Button className="w-full" size="lg">
              Continua lo Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

/**
 * Pagina di successo dopo il pagamento
 * Avvolge il contenuto in Suspense per supportare useSearchParams
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
