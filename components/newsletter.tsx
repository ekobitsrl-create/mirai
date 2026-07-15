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
    <section className="py-20 md:py-28 px-6 bg-card border-t border-border" ref={ref}>
      <div className={`max-w-xl mx-auto text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
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
          <div className="py-4 px-6 border border-primary/30 rounded-sm bg-primary/5">
            <p className="text-sm text-foreground">
              {t.newsletter.success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.newsletter.placeholder}
              required
              className="flex-1 px-4 py-3 bg-secondary border border-border border-r-0 text-foreground placeholder:text-muted-foreground text-sm rounded-l-sm focus:outline-none focus:border-primary transition-all duration-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-r-sm whitespace-nowrap"
            >
              {t.newsletter.subscribe}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
