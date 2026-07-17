"use client"

import { useState } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useLanguage } from "@/lib/language-context"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { ref, isVisible } = useScrollAnimation(0.2)
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="mirai-neon-divider relative overflow-hidden bg-card/70 px-6 py-20 md:py-28" ref={ref}>
      <div className="mirai-aurora-orb left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2" />
      <div className={`mirai-neon-card relative max-w-2xl mx-auto rounded-[2rem] px-6 py-10 text-center transition-all duration-700 sm:px-12 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {t.newsletter.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {t.newsletter.description}
        </p>

        {submitted ? (
          <div className="mirai-neon-outline rounded-xl px-6 py-4">
            <p className="text-sm text-foreground">
              {t.newsletter.success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mirai-neon-outline mx-auto flex max-w-md gap-0 overflow-hidden rounded-full p-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.newsletter.placeholder}
              required
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="mirai-neon-primary whitespace-nowrap rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-primary/90"
            >
              {t.newsletter.subscribe}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
