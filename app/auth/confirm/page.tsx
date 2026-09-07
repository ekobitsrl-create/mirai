"use client"

import { safeNextPath } from "@/lib/auth-redirect"
import Link from "next/link"
import { CheckCircle2, LoaderCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BrandMark } from "@/components/brand-mark"

import { verifyEmailLink } from "@/lib/supabase/verify-email-link"

export default function ConfirmAccountPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [nextPath, setNextPath] = useState("/community/hub")
  const [isRecovery, setIsRecovery] = useState(false)
  const verification = useRef<ReturnType<typeof verifyEmailLink> | null>(null)
  const callbackUrl = useRef<URL | null>(null)

  useEffect(() => {
    let active = true
    let redirectTimer: number | undefined
    const url = callbackUrl.current ?? new URL(window.location.href)
    callbackUrl.current = url
    const recovery = url.searchParams.get("type") === "recovery"
      || new URLSearchParams(url.hash.slice(1)).get("type") === "recovery"
    const destination = recovery ? "/auth/update-password" : safeNextPath(url.searchParams.get("next"))
    setIsRecovery(recovery)
    setNextPath(destination)

    // Reuse the verification during React's effect replay: OTPs are single use.
    verification.current ??= verifyEmailLink(createClient().auth, url)
    void verification.current.then(async (session) => {
      if (!active) return
      const response = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
      })
      if (!response.ok) throw new Error("Impossibile salvare la sessione")
      if (!active) return
      setStatus("success")
      redirectTimer = window.setTimeout(() => {
        window.location.href = destination
      }, 900)
    }).catch(() => {
      if (active) setStatus("error")
    }).finally(() => {
      if (!active) return
      const cleanUrl = new URL("/auth/confirm", url.origin)
      if (recovery) cleanUrl.searchParams.set("type", "recovery")
      else cleanUrl.searchParams.set("next", destination)
      window.history.replaceState({}, "", cleanUrl)
    })

    return () => {
      active = false
      window.clearTimeout(redirectTimer)
    }
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#08070b] px-6 py-12 text-white">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex">
          <BrandMark className="text-xl text-white" />
        </Link>
        <section className="mt-8 rounded-lg border border-primary/25 bg-[#120d19] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
            {status === "loading" && <LoaderCircle className="h-8 w-8 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8" />}
            {status === "error" && <span className="text-xl font-bold">!</span>}
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            {status === "loading" && (isRecovery ? "Verifica del recupero password" : "Attivazione MIRΛI Society")}
            {status === "success" && (isRecovery ? "Link verificato" : "Account Society attivo")}
            {status === "error" && "Link non valido o scaduto"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/50">
            {status === "loading" && (isRecovery ? "Stiamo verificando il link sicuro ricevuto via email." : "Stiamo verificando la tua email e preparando il tuo accesso.")}
            {status === "success" && (isRecovery ? "Tutto pronto. Ora puoi scegliere la nuova password." : "Tutto pronto. Stai tornando al tuo percorso.")}
            {status === "error" && (isRecovery ? "Richiedi un nuovo link dalla pagina di recupero password." : "Prova ad accedere con le tue credenziali oppure ripeti la registrazione.")}
          </p>
          {status === "error" && (
            <Link href={isRecovery ? "/auth/forgot-password" : `/auth/login?redirectTo=${encodeURIComponent(nextPath)}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black">
              {isRecovery ? "Richiedi un nuovo link" : "Vai al login"}
            </Link>
          )}
        </section>
      </div>
    </main>
  )
}
