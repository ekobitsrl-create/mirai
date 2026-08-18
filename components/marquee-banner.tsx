"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { MINIMAL_PROMO_END_ISO } from "@/lib/minimal-promo"

function InfiniteMarquee({ children, speed = "normal", className = "" }: { children: React.ReactNode; speed?: "normal" | "fast"; className?: string }) {
  const animClass = speed === "fast" ? "animate-marquee-fast" : "animate-marquee"
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`${animClass} flex whitespace-nowrap`}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  )
}

export function MarqueeBanner({
  onVisibilityChange,
}: {
  onVisibilityChange?: (visible: boolean) => void
}) {
  const [visible, setVisible] = useState(true)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const updateRemainingTime = () => {
      const nextRemainingMs = Math.max(0, Date.parse(MINIMAL_PROMO_END_ISO) - Date.now())
      setRemainingMs(nextRemainingMs)
      onVisibilityChange?.(nextRemainingMs > 0)
    }

    updateRemainingTime()
    const timer = window.setInterval(updateRemainingTime, 1000)

    return () => window.clearInterval(timer)
  }, [onVisibilityChange])

  if (!visible || remainingMs === 0) return null

  const totalSeconds = Math.floor((remainingMs ?? 48 * 60 * 60 * 1000) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const countdown = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")

  return (
    <div className="relative z-50 border-b border-primary/25 bg-primary">
      <div className="relative">
        <InfiniteMarquee speed="fast" className="py-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center mx-6">
              <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-primary-foreground">
                {t.nav.discountBanner}
              </span>
              <span className="mx-6 text-primary-foreground/40 text-[10px]">{"\u2726"}</span>
              <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-primary-foreground">
                {t.nav.discountCode}
              </span>
              <span className="mx-6 text-primary-foreground/40 text-[10px]">{"\u2726"}</span>
              <span className="font-mono text-[11px] font-extrabold tracking-[0.18em] uppercase tabular-nums text-primary-foreground">
                {t.nav.promoEndsIn} {countdown}
              </span>
              <span className="mx-6 text-primary-foreground/40 text-[10px]">{"\u2726"}</span>
            </span>
          ))}
        </InfiniteMarquee>
        <button
          onClick={() => {
            setVisible(false)
            onVisibilityChange?.(false)
          }}
          aria-label={t.nav.closeBanner}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-primary/90 p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
