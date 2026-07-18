"use client"

import { useState } from "react"
import { Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"

interface CheckoutButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

/**
 * CheckoutButton - Bottone per avviare il pagamento con Stripe Checkout Hosted
 * 
 * Quando cliccato:
 * 1. Invia i dati del carrello a /api/checkout
 * 2. Riceve l'URL della sessione Stripe
 * 3. Reindirizza l'utente alla pagina di checkout Stripe
 */
export function CheckoutButton({ 
  className,
  variant = "default",
  size = "default"
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { items } = useCart()
  const { t } = useLanguage()

  const handleCheckout = async () => {
    // Reset errore precedente
    setError(null)

    // Verifica che ci siano articoli nel carrello
    if (items.length === 0) {
      setError(t.checkout?.emptyCart || "Il carrello è vuoto")
      return
    }

    setIsLoading(true)

    try {
      // Prepara i dati per l'API
      const cartItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        lineId: item.lineId,
        customization: item.customization,
      }))

      // Chiama l'API per creare la sessione checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems }),
      })

      const data = await response.json()

      if (response.status === 401 && data.authRequired) {
        window.location.assign("/auth/sign-up?next=/checkout")
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Errore durante il checkout")
      }

      if (!data.url) {
        throw new Error("URL di checkout non ricevuto")
      }

      // Reindirizza alla pagina di checkout Stripe
      window.location.href = data.url
    } catch (err) {
      console.error("Errore checkout:", err)
      setError(err instanceof Error ? err.message : "Errore durante il pagamento")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Elaborazione...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Paga ora
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}
