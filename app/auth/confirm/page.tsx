"use client"

import Link from "next/link"
import { CheckCircle2, LoaderCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BrandMark } from "@/components/brand-mark"

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/community/hub"
}

type SupportedOtpType = "signup" | "magiclink"

function supportedOtpType(value: string | null): SupportedOtpType | null {
  return value === "signup" || value === "magiclink" ? value : null
}

export default function ConfirmAccountPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [nextPath, setNextPath] = useState("/community/hub")
  const [isRecovery, setIsRecovery] = useState(false)
  const completed = useRef(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tokenHash = searchParams.get("token_hash")
    const otpType = supportedOtpType(searchParams.get("type"))
    const recoveryFromQuery = Boolean(tokenHash && searchParams.get("type") === "recovery")
    const recoveryFromHash = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery"
    const recoveryFromUrl = recoveryFromQuery || recoveryFromHash
    const requestedDestination = safeNextPath(searchParams.get("next"))
    const destination = recoveryFromUrl ? "/auth/update-password" : requestedDestination
    setIsRecovery(recoveryFromUrl)
    setNextPath(destination)
    const supabase = createClient()

    async function completeSession(accessToken: string, refreshToken: string, recovery = false) {
      if (completed.current) return
      completed.current = true

      const finalDestination = recovery ? "/auth/update-password" : destination
      if (recovery) {
        setIsRecovery(true)
        setNextPath(finalDestination)
      }

      const response = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      })

      if (!response.ok) {
        completed.current = false
        setStatus("error")
        return
      }

      setStatus("success")
      window.setTimeout(() => {
        window.location.href = finalDestination
      }, 900)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (recoveryFromQuery) return
      if (session) void completeSession(session.access_token, session.refresh_token, event === "PASSWORD_RECOVERY")
    })

    async function verifyOrRecoverSession() {
      if (tokenHash && (otpType || recoveryFromQuery)) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: recoveryFromQuery ? "recovery" : otpType!,
        })

        const cleanUrl = new URL("/auth/confirm", window.location.origin)
        if (!recoveryFromQuery) cleanUrl.searchParams.set("next", destination)
        window.history.replaceState({}, "", cleanUrl)

        if (error || !data.session) {
          setStatus("error")
          return
        }

        await completeSession(data.session.access_token, data.session.refresh_token, recoveryFromQuery)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        await completeSession(data.session.access_token, data.session.refresh_token, recoveryFromUrl)
        return
      }

      window.setTimeout(() => {
        if (!completed.current) setStatus("error")
      }, 4500)
    }

    void verifyOrRecoverSession()

    return () => listener.subscription.unsubscribe()
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
