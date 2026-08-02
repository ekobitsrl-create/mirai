"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Errore globale MIRAI", error)
    posthog.captureException(error)
  }, [error])

  return (
    <html lang="it">
      <body style={{ margin: 0 }}>
        <main style={pageStyle}>
          <div style={{ width: "100%", maxWidth: 520, border: "1px solid #3a2b4d", padding: 32 }}>
            <p style={{ margin: 0, color: "#a855f7", fontSize: 12, fontWeight: 700, letterSpacing: "0.24em" }}>
              MIRAI
            </p>
            <h1 style={{ margin: "16px 0 0", fontSize: 26 }}>
              La pagina non si è caricata correttamente
            </h1>
            <p style={{ margin: "12px 0 0", color: "#b7adc4", fontSize: 14, lineHeight: 1.6 }}>
              Il carrello è stato conservato. Riprova oppure torna allo shop.
            </p>
            {error.digest && (
              <p style={{ margin: "12px 0 0", color: "#8f849b", fontSize: 12 }}>
                Codice assistenza: {error.digest}
              </p>
            )}
            <div style={{ display: "grid", gap: 12, marginTop: 28 }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  minHeight: 44,
                  border: 0,
                  background: "#8b35f3",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                RIPROVA
              </button>
              <a
                href="/"
                style={{
                  minHeight: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #3a2b4d",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                TORNA ALLO SHOP
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
