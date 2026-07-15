"use client"

import { useState } from "react"
import { X } from "lucide-react"

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

export function MarqueeBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative z-50">
      {/* Top info bar - subtle */}
      <InfiniteMarquee speed="normal" className="bg-secondary border-b border-border py-2">
        {["Spedizione Gratuita", "Resi Gratuiti entro 30 Giorni", "Pagamento Sicuro e Protetto", "Spedizione Express Disponibile"].map((msg, i) => (
          <span key={i} className="mx-8 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            {msg}
          </span>
        ))}
      </InfiniteMarquee>

      {/* Promo discount bar */}
      <div className="bg-primary relative">
        <InfiniteMarquee speed="fast" className="py-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center mx-6">
              <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-primary-foreground">
                OTTIENI IL 10% DI SCONTO SUL PRIMO ORDINE
              </span>
              <span className="mx-6 text-primary-foreground/40 text-[10px]">{"\u2726"}</span>
              <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-primary-foreground">
                CODICE: MIRAI10
              </span>
              <span className="mx-6 text-primary-foreground/40 text-[10px]">{"\u2726"}</span>
            </span>
          ))}
        </InfiniteMarquee>
        <button
          onClick={() => setVisible(false)}
          aria-label="Chiudi banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-primary/80 p-1 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
