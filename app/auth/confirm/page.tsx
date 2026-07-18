"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, LoaderCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/community"
}

export default function ConfirmAccountPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [nextPath, setNextPath] = useState("/community")
  const completed = useRef(false)

  useEffect(() => {
    const destination = safeNextPath(new URLSearchParams(window.location.search).get("next"))
    setNextPath(destination)
    const supabase = createClient()

    async function completeSession(accessToken: string, refreshToken: string) {
      if (completed.current) return
      completed.current = true

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
        window.location.href = destination
      }, 900)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void completeSession(session.access_token, session.refresh_token)
    })

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        void completeSession(data.session.access_token, data.session.refresh_token)
      } else {
        window.setTimeout(() => {
          if (!completed.current) setStatus("error")
        }, 4500)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#08070b] px-6 py-12 text-white">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex">
          <Image src="/images/logo.png" alt="MIRAI" width={120} height={40} className="invert" style={{ width: "auto", height: "auto" }} />
        </Link>
        <section className="mt-8 rounded-lg border border-primary/25 bg-[#120d19] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
            {status === "loading" && <LoaderCircle className="h-8 w-8 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8" />}
            {status === "error" && <span className="text-xl font-bold">!</span>}
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            {status === "loading" && "Attivazione MIRAI PASS"}
            {status === "success" && "MIRAI PASS attivo"}
            {status === "error" && "Link non valido o scaduto"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/50">
            {status === "loading" && "Stiamo verificando la tua email e preparando il tuo accesso."}
            {status === "success" && "Tutto pronto. Stai tornando al tuo percorso."}
            {status === "error" && "Prova ad accedere con le tue credenziali oppure ripeti la registrazione."}
          </p>
          {status === "error" && (
            <Link href={`/auth/login?redirectTo=${encodeURIComponent(nextPath)}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black">
              Vai al login
            </Link>
          )}
        </section>
      </div>
    </main>
  )
}
