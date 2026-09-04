"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BadgePercent, Check, Copy, Sparkles, Timer, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { MINIMAL_PROMO_END_ISO } from "@/lib/minimal-promo"

const STORAGE_KEY = "mirai-minimal-days-modal-seen-2026-08-20-v4"
const DISCOUNT_CODE = "MIRAI10"

export function FirstProductDiscountModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const openedRef = useRef(false)
  const { t, locale } = useLanguage()

  const dismissModal = useCallback(() => {
    setOpen(false)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // Dismissal still works when storage is unavailable.
    }
  }, [])

  useEffect(() => {
    const endAt = Date.parse(MINIMAL_PROMO_END_ISO)
    if (Date.now() >= endAt) return

    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      // Continue in memory when storage is unavailable.
    }

    let timer: number | undefined
    const showOffer = () => {
      if (openedRef.current) return

      const openWhenIntroIsFinished = () => {
        if (document.querySelector("[data-mirai-site-intro]")) {
          timer = window.setTimeout(openWhenIntroIsFinished, 400)
          return
        }

        openedRef.current = true
        setOpen(true)
      }

      timer = window.setTimeout(openWhenIntroIsFinished, 800)
    }

    const hasCookieChoice = document.cookie
      .split("; ")
      .some((row) => row === "cookie_consent=all" || row === "cookie_consent=necessary")

    if (hasCookieChoice) {
      showOffer()
    } else {
      window.addEventListener("mirai:cookie-consent", showOffer, { once: true })
    }

    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener("mirai:cookie-consent", showOffer)
    }
  }, [])

  useEffect(() => {
    const updateRemainingTime = () => {
      const nextRemainingMs = Math.max(0, Date.parse(MINIMAL_PROMO_END_ISO) - Date.now())
      setRemainingMs(nextRemainingMs)
      if (nextRemainingMs === 0) setOpen(false)
    }

    updateRemainingTime()
    const timer = window.setInterval(updateRemainingTime, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissModal()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [dismissModal, open])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  if (!open || remainingMs === 0) return null

  const totalSeconds = Math.floor((remainingMs ?? 48 * 60 * 60 * 1000) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const countdown = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
  const collectionsHref = locale === "it" ? "/collezioni" : `/${locale}/collezioni`

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="minimal-days-offer-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismissModal()
      }}
    >
      <button
        type="button"
        onClick={dismissModal}
        aria-label={t.nav.closeBanner}
        className="fixed right-3 top-3 z-[10001] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/85 text-white shadow-lg backdrop-blur-sm sm:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative my-3 w-full max-w-lg overflow-hidden rounded-3xl border border-primary/35 bg-[#120d1d] p-6 text-white shadow-[0_30px_100px_rgba(100,45,220,0.45)] sm:my-0 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-[90px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-[85px]" aria-hidden="true" />

        <button
          type="button"
          onClick={dismissModal}
          aria-label={t.nav.closeBanner}
          className="absolute right-4 top-4 z-10 hidden rounded-full border border-white/10 bg-black/25 p-2 text-white/60 transition-colors hover:text-white sm:inline-flex"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Minimal Days
          </span>
          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BadgePercent className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/55">MIRΛI Lab Store</p>
              <h2 id="minimal-days-offer-title" className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
                {t.nav.discountBanner}
              </h2>
            </div>
          </div>

          <p className="mt-6 max-w-md text-sm leading-6 text-white/65">
            {t.nav.discountCode}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-lg font-black tabular-nums text-primary sm:text-xl">
            <Timer className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{t.nav.promoEndsIn}</span>
            <span aria-hidden="true">{t.nav.promoEndsIn} {countdown}</span>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 pl-5">
            <span className="font-mono text-xl font-black tracking-[0.22em]">{DISCOUNT_CODE}</span>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? t.nav.codeCopied : t.nav.copyCode}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={dismissModal}
              className="min-h-12 rounded-xl border border-white/15 px-5 text-xs font-bold uppercase tracking-widest text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              {t.nav.continueShopping}
            </button>
            <Link
              href={collectionsHref}
              onClick={dismissModal}
              className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {t.nav.discoverProducts}
            </Link>
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-white/35">
            MIRAI10
          </p>
        </div>
      </div>
    </div>
  )
}
