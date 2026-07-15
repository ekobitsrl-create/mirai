"use client"

import Link from "next/link"
import {
  ArrowRight,
  ChevronDown,
  RotateCcw,
  Ruler,
  Send,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRoundCog,
  X,
} from "lucide-react"
import { FormEvent, useEffect, useRef, useState } from "react"

type MiraVariant = "male" | "female"
type MiraMood = "idle" | "typing" | "happy"

type GuideMessage = {
  id: number
  from: "mira" | "user"
  text: string
  href?: string
  linkLabel?: string
}

type GuideReply = Pick<GuideMessage, "text" | "href" | "linkLabel">

const VARIANT_STORAGE_KEY = "mirai-mira-variant-v1"

const initialMessages: GuideMessage[] = [
  {
    id: 1,
    from: "mira",
    text: "Yo, sono MIRA. Ti guido tra drop, taglie, spedizioni e pagamenti.",
  },
]

const quickActions = [
  { label: "Trova un capo", prompt: "Fammi vedere lo shop", icon: ShoppingBag },
  { label: "Guida taglie", prompt: "Come scelgo la taglia?", icon: Ruler },
  { label: "Spedizioni", prompt: "Come funzionano le spedizioni?", icon: Truck },
  { label: "Resi", prompt: "Come funzionano i resi?", icon: RotateCcw },
] as const

function getGuideReply(input: string): GuideReply {
  const message = input.toLocaleLowerCase("it-IT")

  if (message.includes("tagli") || message.includes("misur")) {
    return {
      text: "Apri la guida taglie nella pagina del prodotto. I capi oversize sono segnalati: in quel caso scegli la tua taglia abituale per mantenere il fit MIRAI.",
      href: "/collezioni",
      linkLabel: "Scegli un prodotto",
    }
  }

  if (message.includes("sped") || message.includes("consegna") || message.includes("corriere")) {
    return {
      text: "La spedizione standard richiede 3–5 giorni lavorativi ed è gratuita da 150 €. L’express richiede 1–2 giorni lavorativi.",
      href: "/spedizioni",
      linkLabel: "Dettagli spedizioni",
    }
  }

  if (message.includes("reso") || message.includes("rimbor")) {
    return {
      text: "Puoi richiedere il reso entro 14 giorni dalla consegna. Per gli ordini spediti in Italia il reso è gratuito.",
      href: "/resi",
      linkLabel: "Come effettuare un reso",
    }
  }

  if (
    message.includes("pagament") ||
    message.includes("paypal") ||
    message.includes("klarna") ||
    message.includes("carta")
  ) {
    return {
      text: "Il checkout è gestito in sicurezza da Stripe. Puoi pagare con carta e, quando disponibili per il tuo acquisto, PayPal, Klarna, Apple Pay o Google Pay.",
      href: "/faq",
      linkLabel: "FAQ pagamenti",
    }
  }

  if (
    message.includes("shop") ||
    message.includes("prodot") ||
    message.includes("capo") ||
    message.includes("magli") ||
    message.includes("drop")
  ) {
    return {
      text: "Ti porto nel drop attuale. Puoi filtrare per categoria, disponibilità, prezzo e taglia.",
      href: "/collezioni",
      linkLabel: "Entra nello Shop",
    }
  }

  if (message.includes("ciao") || message.includes("hey") || message.includes("salve")) {
    return {
      text: "Yo! Dimmi cosa cerchi: un capo, una taglia, informazioni sulla spedizione oppure sui pagamenti.",
    }
  }

  return {
    text: "Sto ancora imparando il mondo MIRAI. Per ora posso aiutarti con prodotti, taglie, spedizioni, resi e pagamenti.",
    href: "/faq",
    linkLabel: "Consulta le FAQ",
  }
}

function MiraCharacter({
  variant,
  mood = "idle",
  compact = false,
  className = "",
}: {
  variant: MiraVariant
  mood?: MiraMood
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={`relative isolate ${compact ? "h-16 w-14" : "h-32 w-24 md:h-52 md:w-36"} ${className}`}
      aria-label={variant === "female" ? "MIRA, avatar femminile" : "MIRA, avatar maschile"}
      role="img"
    >
      <div className="mira-glow absolute inset-x-[8%] bottom-[2%] h-[24%] rounded-full bg-primary/45 blur-2xl" />
      <div
        className={`mira-character-crop absolute inset-0 bg-no-repeat ${mood === "typing" ? "mira-typing" : mood === "happy" ? "mira-happy" : "mira-idle"}`}
        style={{
          backgroundImage: "url('/mascot/mira-concept.webp')",
          backgroundPosition: variant === "female" ? "right bottom" : "left bottom",
          backgroundSize: "auto 100%",
        }}
      />
    </div>
  )
}

function VariantCard({
  variant,
  selected,
  onSelect,
}: {
  variant: MiraVariant
  selected: boolean
  onSelect: () => void
}) {
  const female = variant === "female"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative min-h-44 overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
        selected
          ? "border-primary bg-primary/15 shadow-[0_0_32px_rgba(159,134,255,0.28)]"
          : "border-white/10 bg-white/[0.035] hover:border-primary/55 hover:bg-primary/10"
      }`}
      aria-pressed={selected}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(132,73,255,0.24),transparent_62%)]" />
      <MiraCharacter
        variant={variant}
        className="mira-card-character absolute -bottom-3 left-1/2 -translate-x-1/2 scale-[0.82] transition-transform duration-500 group-hover:scale-[0.88]"
      />
      <span className="absolute inset-x-3 bottom-3 flex items-end justify-between rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
        <span>
          <span className="block text-[8px] uppercase tracking-[0.22em] text-primary">MIRA</span>
          <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            {female ? "Femminile" : "Maschile"}
          </span>
        </span>
        <span className={`h-2.5 w-2.5 rounded-full border ${selected ? "border-primary bg-primary shadow-[0_0_12px_rgba(159,134,255,0.9)]" : "border-white/35"}`} />
      </span>
    </button>
  )
}

export function MiraGuide() {
  const [hydrated, setHydrated] = useState(false)
  const [variant, setVariant] = useState<MiraVariant | null>(null)
  const [pendingVariant, setPendingVariant] = useState<MiraVariant>("male")
  const [isOpen, setIsOpen] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<GuideMessage[]>(initialMessages)
  const messageId = useRef(2)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    let savedVariant: MiraVariant | null = null

    try {
      const saved = window.localStorage.getItem(VARIANT_STORAGE_KEY)
      if (saved === "male" || saved === "female") savedVariant = saved
    } catch {
      // The guide remains available when browser storage is blocked.
    }

    setVariant(savedVariant)
    if (savedVariant) setPendingVariant(savedVariant)
    setHydrated(true)

    const revealTimer = window.setTimeout(() => {
      if (savedVariant) {
        setShowNudge(true)
      } else {
        setShowSelector(true)
        setIsOpen(true)
      }
    }, savedVariant ? 2300 : 1700)

    const hideNudgeTimer = window.setTimeout(() => setShowNudge(false), 8500)
    timeoutsRef.current.push(revealTimer, hideNudgeTimer)

    return () => {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout))
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [isTyping, messages])

  function chooseVariant() {
    setVariant(pendingVariant)
    setShowSelector(false)
    setShowNudge(false)
    setMessages([
      {
        id: messageId.current++,
        from: "mira",
        text: `Scelta fatta. Sono la tua MIRA ${pendingVariant === "female" ? "F" : "M"}. Da dove partiamo?`,
      },
    ])

    try {
      window.localStorage.setItem(VARIANT_STORAGE_KEY, pendingVariant)
    } catch {
      // Keep the selected avatar for the current session.
    }
  }

  function openGuide() {
    setShowNudge(false)
    setIsOpen(true)
    if (!variant) setShowSelector(true)
  }

  function sendMessage(rawMessage: string) {
    const cleanMessage = rawMessage.trim()
    if (!cleanMessage || isTyping) return

    setMessages((current) => [
      ...current,
      { id: messageId.current++, from: "user", text: cleanMessage },
    ])
    setInput("")
    setIsTyping(true)

    const responseTimer = window.setTimeout(() => {
      const reply = getGuideReply(cleanMessage)
      setMessages((current) => [
        ...current,
        { id: messageId.current++, from: "mira", ...reply },
      ])
      setIsTyping(false)
    }, 720)

    timeoutsRef.current.push(responseTimer)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage(input)
  }

  if (!hydrated) return null

  const activeVariant = variant || pendingVariant

  return (
    <div className="mira-guide-root">
      {!isOpen && (
        <div className="mira-enter fixed bottom-[7.5rem] right-3 z-[60] flex items-end md:bottom-3 md:right-[5.6rem]">
          {showNudge && (
            <button
              type="button"
              onClick={openGuide}
              className="mira-nudge absolute bottom-[68%] right-[72%] w-48 rounded-2xl rounded-br-sm border border-primary/30 bg-[#160f20]/95 p-3 text-left shadow-[0_0_35px_rgba(126,87,194,0.25)] backdrop-blur-xl"
            >
              <span className="block text-[8px] font-semibold uppercase tracking-[0.22em] text-primary">MIRA online</span>
              <span className="mt-1 block text-xs leading-5 text-white/80">Yo, serve una mano con il drop?</span>
            </button>
          )}
          <button
            type="button"
            onClick={openGuide}
            className="group relative rounded-[45%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Apri la guida MIRA"
          >
            <span className="absolute inset-x-[12%] bottom-[8%] h-14 rounded-full border border-primary/25 bg-[#120c19]/80 shadow-[0_0_35px_rgba(159,134,255,0.35)] backdrop-blur-sm transition-all group-hover:border-primary/55 group-hover:shadow-[0_0_48px_rgba(159,134,255,0.5)]" />
            <MiraCharacter variant={activeVariant} />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-black/70 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              Chiedi a MIRA
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <section
          className="mira-panel fixed bottom-[5.75rem] right-4 z-[80] flex max-h-[calc(100dvh-7rem)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[24px] border border-primary/35 bg-[#120c1a]/95 text-white shadow-[0_0_70px_rgba(126,87,194,0.3)] backdrop-blur-2xl"
          aria-label="Chat con MIRA"
        >
          <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_16px_rgba(159,134,255,0.9)]" />
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-primary/45 bg-primary/10">
                <MiraCharacter variant={activeVariant} mood={isTyping ? "typing" : "idle"} compact className="scale-[1.45] translate-y-2" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">MIRA</p>
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.15em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" /> online
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] text-white/45">MIRAI LAB GUIDE · BETA</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {variant && (
                <button
                  type="button"
                  onClick={() => setShowSelector((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Cambia avatar MIRA"
                >
                  <UserRoundCog className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Chiudi MIRA"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showSelector ? (
            <div className="overflow-y-auto p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em]">Choose your guide</p>
                </div>
                <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">Scegli la tua MIRA</h2>
                <p className="mt-1.5 text-xs leading-5 text-white/50">Stessa personalità, due avatar. Potrai cambiare scelta quando vuoi.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <VariantCard variant="male" selected={pendingVariant === "male"} onSelect={() => setPendingVariant("male")} />
                <VariantCard variant="female" selected={pendingVariant === "female"} onSelect={() => setPendingVariant("female")} />
              </div>
              <button
                type="button"
                onClick={chooseVariant}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_28px_rgba(159,134,255,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_38px_rgba(159,134,255,0.5)]"
              >
                Continua con MIRA {pendingVariant === "female" ? "F" : "M"}
                <ArrowRight className="h-4 w-4" />
              </button>
              {variant && (
                <button
                  type="button"
                  onClick={() => setShowSelector(false)}
                  className="mx-auto mt-3 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-white/45 hover:text-white"
                >
                  <ChevronDown className="h-3.5 w-3.5" /> Torna alla chat
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                        message.from === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-white/10 bg-white/[0.055] text-white/[0.78]"
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.href && message.linkLabel && (
                        <Link
                          href={message.href}
                          onClick={() => setIsOpen(false)}
                          className="mt-2 flex items-center gap-1.5 border-t border-white/10 pt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-white"
                        >
                          {message.linkLabel} <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.055] px-3.5 py-3" aria-label="MIRA sta scrivendo">
                      {[0, 1, 2].map((dot) => (
                        <span key={dot} className="mira-typing-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${dot * 130}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {quickActions.map(({ label, prompt, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      disabled={isTyping}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.035] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/60 transition-colors hover:border-primary/50 hover:text-white disabled:opacity-40"
                    >
                      <Icon className="h-3 w-3 text-primary" /> {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-black/20 p-1.5 focus-within:border-primary/60">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Chiedi qualcosa a MIRA..."
                    maxLength={240}
                    className="h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/30"
                    aria-label="Messaggio per MIRA"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/25"
                    aria-label="Invia messaggio"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
                <p className="mt-2 text-center text-[8px] leading-4 text-white/30">Guida beta con risposte informative MIRAI. Nessuna operazione viene eseguita senza conferma.</p>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
