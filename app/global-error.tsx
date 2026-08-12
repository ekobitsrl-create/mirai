"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/translations"

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "#0b0611",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
  textAlign: "center" as const,
}

const copy: Record<Locale, { title: string; body: string; support: string; retry: string; shop: string }> = {
  it: { title: "La pagina non si è caricata correttamente", body: "Il carrello è stato conservato. Riprova oppure torna allo shop.", support: "Codice assistenza", retry: "RIPROVA", shop: "TORNA ALLO SHOP" },
  en: { title: "The page did not load correctly", body: "Your cart has been saved. Try again or return to the shop.", support: "Support code", retry: "TRY AGAIN", shop: "BACK TO SHOP" },
  es: { title: "La página no se ha cargado correctamente", body: "Tu carrito se ha guardado. Inténtalo de nuevo o vuelve a la tienda.", support: "Código de asistencia", retry: "REINTENTAR", shop: "VOLVER A LA TIENDA" },
  de: { title: "Die Seite wurde nicht korrekt geladen", body: "Dein Warenkorb wurde gespeichert. Versuche es erneut oder kehre zum Shop zurück.", support: "Support-Code", retry: "ERNEUT VERSUCHEN", shop: "ZURÜCK ZUM SHOP" },
  fr: { title: "La page ne s’est pas chargée correctement", body: "Votre panier a été conservé. Réessayez ou retournez à la boutique.", support: "Code d’assistance", retry: "RÉESSAYER", shop: "RETOUR À LA BOUTIQUE" },
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<Locale>("it")

  useEffect(() => {
    console.error("Errore globale MIRAI", error)
    try {
      const saved = window.localStorage.getItem("mirai-locale") as Locale | null
      if (saved && saved in copy) setLocale(saved)
    } catch {
      // The Italian fallback remains available when browser storage is blocked.
    }
  }, [error])

  const text = copy[locale]

  return (
    <html lang={locale}>
      <body style={{ margin: 0 }}>
        <main style={pageStyle}>
          <div style={{ width: "100%", maxWidth: 520, border: "1px solid #3a2b4d", padding: 32 }}>
            <p style={{ margin: 0, color: "#a855f7", fontSize: 12, fontWeight: 700, letterSpacing: "0.24em" }}>MIRAI</p>
            <h1 style={{ margin: "16px 0 0", fontSize: 26 }}>{text.title}</h1>
            <p style={{ margin: "12px 0 0", color: "#b7adc4", fontSize: 14, lineHeight: 1.6 }}>{text.body}</p>
            {error.digest && <p style={{ margin: "12px 0 0", color: "#8f849b", fontSize: 12 }}>{text.support}: {error.digest}</p>}
            <div style={{ display: "grid", gap: 12, marginTop: 28 }}>
              <button type="button" onClick={reset} style={{ minHeight: 44, border: 0, background: "#8b35f3", color: "#ffffff", cursor: "pointer", fontWeight: 700 }}>{text.retry}</button>
              <a href="/" style={{ minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #3a2b4d", color: "#ffffff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{text.shop}</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
