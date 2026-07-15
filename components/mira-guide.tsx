"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Sparkles, UserRoundCog, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type MiraVariant = "male" | "female"
type MiraMood = "neutral" | "thinking" | "happy" | "surprised"
type MiraSpot = "right-bottom" | "right-middle" | "left-middle"

type MiraPrompt = {
  text: string
  label: string
  href: string
  mood: MiraMood
}

const VARIANT_STORAGE_KEY = "mirai-mira-variant-v1"
const MIRA_SPOTS: MiraSpot[] = ["right-bottom", "right-middle", "left-middle", "right-bottom"]

const DEFAULT_PROMPTS: MiraPrompt[] = [
  {
    text: "Yo, serve una mano per un capo?",
    label: "Vai allo shop",
    href: "/collezioni",
    mood: "neutral",
  },
  {
    text: "Bro, cosa cerchi?",
    label: "Cerca un capo",
    href: "/collezioni#shop-search",
    mood: "thinking",
  },
  {
    text: "Vuoi trovare il fit giusto? Ci penso io.",
    label: "Guarda i capi",
    href: "/collezioni",
    mood: "happy",
  },
  {
    text: "Spedizione o reso? Ti porto alle info giuste.",
    label: "Info utili",
    href: "/faq",
    mood: "surprised",
  },
]

const FACE_ASSETS: Record<MiraMood, string> = {
  neutral: "/mascot/mira-face-neutral.webp",
  thinking: "/mascot/mira-face-thinking.webp",
  happy: "/mascot/mira-face-happy.webp",
  surprised: "/mascot/mira-face-surprised.webp",
}

function getContextPrompts(pathname: string): MiraPrompt[] {
  if (pathname.startsWith("/prodotto/")) {
    return [
      {
        text: "Questo capo ti prende? Dai un occhio al fit prima di scegliere.",
        label: "Vedi altri capi",
        href: "/collezioni",
        mood: "thinking",
      },
      {
        text: "Bro, vuoi sapere come funziona la consegna?",
        label: "Spedizioni",
        href: "/spedizioni",
        mood: "neutral",
      },
      ...DEFAULT_PROMPTS,
    ]
  }

  if (pathname.startsWith("/collezioni") || pathname.startsWith("/collezione/")) {
    return [
      {
        text: "Bro, che vibe cerchi oggi?",
        label: "Cerca nello shop",
        href: "/collezioni#shop-search",
        mood: "thinking",
      },
      {
        text: "Quel capo lì ha carattere. Vuoi guardarlo meglio?",
        label: "Scopri i capi",
        href: "/collezioni",
        mood: "happy",
      },
      ...DEFAULT_PROMPTS,
    ]
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/success")) {
    return [
      {
        text: "Ci siamo quasi. Controlla taglia e indirizzo, poi sei a posto.",
        label: "Info consegna",
        href: "/spedizioni",
        mood: "happy",
      },
      ...DEFAULT_PROMPTS,
    ]
  }

  if (pathname.startsWith("/chi-siamo")) {
    return [
      {
        text: "Qui c'è la storia di MIRAI. È da qui che parte tutto.",
        label: "Guarda lo shop",
        href: "/collezioni",
        mood: "happy",
      },
      ...DEFAULT_PROMPTS,
    ]
  }

  return DEFAULT_PROMPTS
}

function MiraCharacter({
  variant,
  mood = "neutral",
  className = "",
}: {
  variant: MiraVariant
  mood?: MiraMood
  className?: string
}) {
  return (
    <div
      className={`relative isolate h-32 w-24 md:h-52 md:w-36 ${className}`}
      aria-label={variant === "female" ? "MIRA, avatar femminile" : "MIRA, avatar maschile"}
      role="img"
    >
      <div className="mira-glow absolute inset-x-[8%] bottom-[2%] h-[24%] rounded-full bg-primary/45 blur-2xl" />
      <div className={`absolute inset-0 mira-pose-${mood}`}>
        <div
          className="mira-character-crop absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url('/mascot/mira-${variant}.webp')`,
            backgroundPosition: "center bottom",
            backgroundSize: "auto 100%",
          }}
        />
        <div
          key={mood}
          className={`mira-expression mira-expression-${variant} absolute z-10 aspect-square h-[18%] rounded-full bg-cover bg-center bg-no-repeat`}
          style={{ backgroundImage: `url('${FACE_ASSETS[mood]}')` }}
          aria-hidden="true"
        />
      </div>
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
      className={`group relative min-h-48 overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
        selected
          ? "border-primary bg-primary/15 shadow-[0_0_32px_rgba(159,134,255,0.28)]"
          : "border-white/10 bg-white/[0.035] hover:border-primary/55 hover:bg-primary/10"
      }`}
      aria-pressed={selected}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(132,73,255,0.24),transparent_62%)]" />
      <MiraCharacter
        variant={variant}
        mood={selected ? "happy" : "neutral"}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 scale-[0.86] transition-transform duration-500 group-hover:scale-[0.92]"
      />
      <span className="absolute inset-x-3 bottom-3 flex items-end justify-between rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
        <span>
          <span className="block text-[8px] uppercase tracking-[0.22em] text-primary">MIRA</span>
          <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            {female ? "Femminile" : "Maschile"}
          </span>
        </span>
        <span
          className={`h-2.5 w-2.5 rounded-full border ${
            selected
              ? "border-primary bg-primary shadow-[0_0_12px_rgba(159,134,255,0.9)]"
              : "border-white/35"
          }`}
        />
      </span>
    </button>
  )
}

export function MiraGuide() {
  const pathname = usePathname()
  const prompts = useMemo(() => getContextPrompts(pathname), [pathname])
  const [hydrated, setHydrated] = useState(false)
  const [variant, setVariant] = useState<MiraVariant | null>(null)
  const [pendingVariant, setPendingVariant] = useState<MiraVariant>("male")
  const [showSelector, setShowSelector] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [spotIndex, setSpotIndex] = useState(0)
  const [cycleToken, setCycleToken] = useState(0)

  useEffect(() => {
    let savedVariant: MiraVariant | null = null

    try {
      const saved = window.localStorage.getItem(VARIANT_STORAGE_KEY)
      if (saved === "male" || saved === "female") savedVariant = saved
    } catch {
      // MIRA remains available when browser storage is blocked.
    }

    setVariant(savedVariant)
    if (savedVariant) setPendingVariant(savedVariant)
    setHydrated(true)

    if (!savedVariant) {
      const selectorTimer = window.setTimeout(() => setShowSelector(true), 1100)
      return () => window.clearTimeout(selectorTimer)
    }
  }, [])

  useEffect(() => {
    setPromptIndex(0)
    setBubbleVisible(false)
    setCycleToken((current) => current + 1)
  }, [pathname])

  useEffect(() => {
    if (!hydrated || !variant || showSelector) return

    let cancelled = false
    let hideTimer = 0
    let nextTimer = 0

    const runCycle = (delay: number) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return
        setBubbleVisible(true)

        hideTimer = window.setTimeout(() => {
          if (cancelled) return
          setBubbleVisible(false)
        }, 6100)

        nextTimer = window.setTimeout(() => {
          if (cancelled) return
          setPromptIndex((current) => (current + 1) % prompts.length)
          setSpotIndex((current) => (current + 1) % MIRA_SPOTS.length)
          runCycle(1250)
        }, 8300)
      }, delay)
    }

    runCycle(1250)

    return () => {
      cancelled = true
      window.clearTimeout(hideTimer)
      window.clearTimeout(nextTimer)
    }
  }, [cycleToken, hydrated, prompts.length, showSelector, variant])

  function chooseVariant() {
    setVariant(pendingVariant)
    setShowSelector(false)
    setPromptIndex(0)
    setSpotIndex(0)
    setBubbleVisible(false)
    setCycleToken((current) => current + 1)

    try {
      window.localStorage.setItem(VARIANT_STORAGE_KEY, pendingVariant)
    } catch {
      // Keep the selected avatar for the current session.
    }
  }

  function advanceMira() {
    setBubbleVisible(false)
    setPromptIndex((current) => (current + 1) % prompts.length)
    setSpotIndex((current) => (current + 1) % MIRA_SPOTS.length)
    setCycleToken((current) => current + 1)
  }

  function openSelector() {
    if (variant) setPendingVariant(variant)
    setBubbleVisible(false)
    setShowSelector(true)
  }

  if (!hydrated) return null

  const activeVariant = variant || pendingVariant
  const currentPrompt = prompts[promptIndex % prompts.length]
  const currentSpot = MIRA_SPOTS[spotIndex % MIRA_SPOTS.length]
  const bubbleOnLeft = currentSpot !== "left-middle"

  return (
    <div className="mira-guide-root">
      {showSelector && (
        <div
          className="mira-selector-backdrop fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-4 backdrop-blur-md md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Scegli la tua MIRA"
        >
          <section className="mira-selector relative w-full max-w-xl overflow-hidden rounded-[28px] border border-primary/35 bg-[#120c1a]/95 p-5 text-white shadow-[0_0_80px_rgba(126,87,194,0.35)] md:p-6">
            <div className="pointer-events-none absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_18px_rgba(159,134,255,0.95)]" />
            {variant && (
              <button
                type="button"
                onClick={() => setShowSelector(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Chiudi selezione MIRA"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="mb-5 pr-10">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em]">La tua guida</p>
              </div>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">Scegli la tua MIRA</h2>
              <p className="mt-1.5 text-xs leading-5 text-white/50">
                Stessa energia, due avatar. MIRA si muoverà nel sito e ti darà una mano quando serve.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <VariantCard
                variant="male"
                selected={pendingVariant === "male"}
                onSelect={() => setPendingVariant("male")}
              />
              <VariantCard
                variant="female"
                selected={pendingVariant === "female"}
                onSelect={() => setPendingVariant("female")}
              />
            </div>
            <button
              type="button"
              onClick={chooseVariant}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_28px_rgba(159,134,255,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_38px_rgba(159,134,255,0.5)]"
            >
              Continua con MIRA {pendingVariant === "female" ? "F" : "M"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      )}

      {variant && !showSelector && (
        <aside
          className={`mira-presence mira-spot-${currentSpot}`}
          aria-label="MIRA, guida del sito"
        >
          <div
            className={`mira-speech-cloud ${bubbleOnLeft ? "mira-bubble-left" : "mira-bubble-right"} ${
              bubbleVisible ? "mira-bubble-visible" : "mira-bubble-hidden"
            }`}
            aria-live="polite"
          >
            <span className="mira-cloud-orb mira-cloud-orb-one" aria-hidden="true" />
            <span className="mira-cloud-orb mira-cloud-orb-two" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setBubbleVisible(false)}
              className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Nascondi messaggio di MIRA"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="relative z-[1] text-[8px] font-semibold uppercase tracking-[0.22em] text-primary">
              MIRA
            </p>
            <p className="relative z-[1] mt-1.5 pr-4 text-[13px] font-medium leading-5 text-white/90">
              {currentPrompt.text}
            </p>
            <Link
              href={currentPrompt.href}
              className="relative z-[1] mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-white"
            >
              {currentPrompt.label} <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="mira-cloud-tail" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={advanceMira}
            className="group relative block rounded-[45%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Fai parlare e muovere MIRA"
          >
            <span className="absolute inset-x-[12%] bottom-[8%] h-14 rounded-full border border-primary/25 bg-[#120c19]/55 shadow-[0_0_35px_rgba(159,134,255,0.35)] backdrop-blur-sm transition-all group-hover:border-primary/55 group-hover:shadow-[0_0_52px_rgba(159,134,255,0.55)]" />
            <MiraCharacter variant={activeVariant} mood={currentPrompt.mood} />
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-black/65 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              MIRA
            </span>
          </button>

          <button
            type="button"
            onClick={openSelector}
            className="mira-avatar-switch absolute -bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-[#120c19]/80 text-white/45 shadow-[0_0_18px_rgba(159,134,255,0.2)] backdrop-blur-md transition-all hover:border-primary/60 hover:text-white"
            aria-label="Cambia avatar MIRA"
          >
            <UserRoundCog className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}
    </div>
  )
}
