"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BadgePercent, Check, Copy, Sparkles, X } from "lucide-react"

const STORAGE_KEY = "mirai-first-product-discount-seen"
const DISCOUNT_CODE = "MIRAI10"

export function FirstProductDiscountModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const openedRef = useRef(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return
    } catch {
      // Continue in memory when storage is unavailable.
    }

    let timer: number | undefined
    let fallbackTimer: number | undefined

    const showOffer = () => {
      if (openedRef.current) return
      openedRef.current = true
      timer = window.setTimeout(() => {
        setOpen(true)
        try {
          window.localStorage.setItem(STORAGE_KEY, "1")
        } catch {
          // The modal still works for this visit.
        }
      }, 800)
    }

    const hasCookieChoice = document.cookie
      .split("; ")
      .some((row) => row === "cookie_consent=all" || row === "cookie_consent=necessary")

    if (hasCookieChoice) {
      showOffer()
    } else {
      window.addEventListener("mirai:cookie-consent", showOffer, { once: true })
      fallbackTimer = window.setTimeout(showOffer, 6000)
    }

    return () => {
      if (timer) window.clearTimeout(timer)
      if (fallbackTimer) window.clearTimeout(fallbackTimer)
      window.removeEventListener("mirai:cookie-consent", showOffer)
    }
  }, [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-order-offer-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-primary/35 bg-[#120d1d] p-6 text-white shadow-[0_30px_100px_rgba(100,45,220,0.45)] sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-[90px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-[85px]" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Chiudi offerta"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/25 p-2 text-white/60 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Benvenuto in MIRAI
          </span>
          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BadgePercent className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/55">Il tuo primo ordine</p>
              <h2 id="first-order-offer-title" className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                10% di sconto
              </h2>
            </div>
          </div>

          <p className="mt-6 max-w-md text-sm leading-6 text-white/65">
            Inserisci questo codice nel checkout. Lo sconto verrà calcolato immediatamente sul totale dei prodotti.
          </p>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 pl-5">
            <span className="font-mono text-xl font-black tracking-[0.22em]">{DISCOUNT_CODE}</span>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiato" : "Copia"}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-12 rounded-xl border border-white/15 px-5 text-xs font-bold uppercase tracking-widest text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Continua qui
            </button>
            <Link
              href="/collezioni"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Scopri lo shop
            </Link>
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-white/35">
            Valido una volta, esclusivamente sul primo ordine
          </p>
        </div>
      </div>
    </div>
  )
}
