"use client"

import { useEffect } from "react"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Errore client MIRAI", error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="w-full max-w-lg border border-border bg-card p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">MIRAI</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          La pagina non si è caricata correttamente
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Il carrello è stato conservato. Riprova oppure torna allo shop.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground">Codice assistenza: {error.digest}</p>
        )}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={reset}
            className="bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            Riprova
          </button>
          <a
            href="/"
            className="border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground"
          >
            Torna allo shop
          </a>
        </div>
      </div>
    </main>
  )
}
