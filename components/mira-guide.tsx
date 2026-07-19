"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Mic, MicOff, Move, Send, Sparkles, UserRoundCog, X } from "lucide-react"
import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { getMiraLocalReply, setMiraCatalog, type MiraIntent } from "@/lib/mira-knowledge"
import type { StoreProduct } from "@/lib/products"

type MiraVariant = "male" | "female"
type MiraAssetPose = "idle" | "listening" | "speaking"
type MiraPose = MiraAssetPose | "curious" | "dragging"

const MIRA_POSE_ASSET: Record<MiraPose, MiraAssetPose> = {
  idle: "speaking",
  listening: "listening",
  speaking: "idle",
  curious: "listening",
  dragging: "speaking",
}

type MiraPosition = {
  x: number
  y: number
}

type MiraReply = {
  text: string
  href?: string
  label?: string
}

type MiraTurn = {
  role: "user" | "assistant"
  content: string
}

type MiraApiResponse = {
  configured?: boolean
  reply?: string
  href?: string
  label?: string
}

type SpeechResult = {
  isFinal: boolean
  0: { transcript: string }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechResult>
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const VARIANT_STORAGE_KEY = "mirai-mira-variant-v1"
const POSITION_STORAGE_KEY = "mirai-mira-position-v1"

function getContextPrompt(pathname: string) {
  if (pathname.startsWith("/prodotto/")) return "Yo, dubbi su questo capo? Chiedimi pure."
  if (pathname.startsWith("/collezioni") || pathname.startsWith("/collezione/")) {
    return "Bro, cosa cerchi? Ti aiuto a trovare il capo giusto."
  }
  if (pathname.startsWith("/checkout")) return "Ci siamo quasi. Serve una mano con ordine o consegna?"
  if (pathname.startsWith("/custom-lab")) return "Yo, vuoi creare la tua tee? Ti guido io nel Custom Lab."
  if (pathname.startsWith("/spedizioni")) return "La spedizione standard è gratuita. Vuoi sapere i tempi?"
  if (pathname.startsWith("/resi")) return "Hai un dubbio sul reso? Dimmi pure."
  return "Yo, serve una mano per un capo?"
}

function getStageSize() {
  const desktop = window.innerWidth >= 768
  return { width: desktop ? 144 : 96, height: desktop ? 208 : 128 }
}

function clampPosition(position: MiraPosition) {
  const stage = getStageSize()
  const minX = 12
  const minY = window.innerWidth >= 768 ? 100 : 92
  const maxX = Math.max(minX, window.innerWidth - stage.width - 12)
  const maxY = Math.max(minY, window.innerHeight - stage.height - 12)
  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  }
}

function MiraModel({
  variant,
  pose,
  faceRight = false,
  className = "",
}: {
  variant: MiraVariant
  pose: MiraPose
  faceRight?: boolean
  className?: string
}) {
  return (
    <div
      className={`mira-model mira-model-state-${pose} relative h-32 w-24 md:h-52 md:w-36 ${className}`}
      role="img"
      aria-label={`MIRA, avatar ${variant === "female" ? "femminile" : "maschile"}, posa ${pose}`}
    >
      <div className="mira-model-glow absolute inset-x-[7%] bottom-[1%] h-[24%] rounded-full bg-primary/45 blur-2xl" />
      <div className="mira-model-scan pointer-events-none absolute inset-x-[15%] z-10 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent shadow-[0_0_9px_rgba(159,134,255,0.8)]" />
      <div
        key={`${variant}-${pose}-${faceRight}`}
        className={`mira-model-sprite mira-model-${pose} absolute inset-0 ${faceRight ? "mira-model-flipped" : ""}`}
      >
        <Image
          src={`/mascot/mira-${variant}-${MIRA_POSE_ASSET[pose]}.webp`}
          alt=""
          fill
          sizes="(min-width: 768px) 144px, 96px"
          className="select-none object-contain object-bottom"
          draggable={false}
          priority
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
      <MiraModel
        variant={variant}
        pose="idle"
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 scale-[0.88] transition-transform duration-500 group-hover:scale-[0.94]"
      />
      <span className="absolute inset-x-3 bottom-3 flex items-end justify-between rounded-xl border border-white/10 bg-black/65 px-3 py-2 backdrop-blur-md">
        <span>
          <span className="block text-[8px] uppercase tracking-[0.22em] text-primary">MIRA</span>
          <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            {variant === "female" ? "Femminile" : "Maschile"}
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
  const contextualPrompt = useMemo(() => getContextPrompt(pathname), [pathname])
  const [hydrated, setHydrated] = useState(false)
  const [variant, setVariant] = useState<MiraVariant | null>(null)
  const [pendingVariant, setPendingVariant] = useState<MiraVariant>("male")
  const [showSelector, setShowSelector] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [reply, setReply] = useState<MiraReply>({ text: "Yo, dimmi pure. Che cosa cerchi?" })
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [ambientCurious, setAmbientCurious] = useState(false)
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 })
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [positionReady, setPositionReady] = useState(false)
  const [position, setPosition] = useState<MiraPosition>({ x: 12, y: 120 })
  const [viewportWidth, setViewportWidth] = useState(1280)
  const [viewportHeight, setViewportHeight] = useState(800)

  const stageRef = useRef<HTMLElement>(null)
  const positionRef = useRef(position)
  const holdTimerRef = useRef<number | null>(null)
  const poseTimerRef = useRef<number | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const conversationRef = useRef<MiraTurn[]>([])
  const requestInFlightRef = useRef(false)
  const requestAbortRef = useRef<AbortController | null>(null)
  const lastLocalIntentRef = useRef<MiraIntent | null>(null)
  const lastLocalProductRef = useRef<string | null>(null)
  const suppressClickRef = useRef(false)
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
  })

  useEffect(() => {
    let active = true
    fetch("/api/mira")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { products?: StoreProduct[] } | null) => {
        if (active && payload?.products) setMiraCatalog(payload.products)
      })
      .catch(() => {
        // Offline product answers stay disabled if the catalog can't be loaded.
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let savedVariant: MiraVariant | null = null

    try {
      const saved = window.localStorage.getItem(VARIANT_STORAGE_KEY)
      if (saved === "male" || saved === "female") savedVariant = saved
    } catch {
      // MIRA remains available when storage is blocked.
    }

    const stage = getStageSize()
    const minX = 12
    const minY = window.innerWidth >= 768 ? 100 : 92
    const maxX = Math.max(minX, window.innerWidth - stage.width - 12)
    const maxY = Math.max(minY, window.innerHeight - stage.height - 12)
    let initialPosition = {
      x: window.innerWidth - stage.width - (window.innerWidth >= 768 ? 88 : 18),
      y: window.innerHeight - stage.height - (window.innerWidth >= 768 ? 28 : 110),
    }

    try {
      const savedPosition = JSON.parse(window.localStorage.getItem(POSITION_STORAGE_KEY) || "null")
      if (
        savedPosition &&
        typeof savedPosition.xRatio === "number" &&
        typeof savedPosition.yRatio === "number"
      ) {
        initialPosition = {
          x: minX + Math.min(1, Math.max(0, savedPosition.xRatio)) * (maxX - minX),
          y: minY + Math.min(1, Math.max(0, savedPosition.yRatio)) * (maxY - minY),
        }
      }
    } catch {
      // Use the default position.
    }

    const safePosition = clampPosition(initialPosition)
    positionRef.current = safePosition
    setPosition(safePosition)
    setViewportWidth(window.innerWidth)
    setViewportHeight(window.innerHeight)
    setPositionReady(true)
    setVariant(savedVariant)
    if (savedVariant) setPendingVariant(savedVariant)
    setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    setHydrated(true)

    const selectorTimer = !savedVariant
      ? window.setTimeout(() => setShowSelector(true), 1100)
      : null

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
      const next = clampPosition(positionRef.current)
      positionRef.current = next
      setPosition(next)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      if (selectorTimer) window.clearTimeout(selectorTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (!variant || showSelector || expanded || isDragging) return
    setShowNudge(false)
    const revealTimer = window.setTimeout(() => setShowNudge(true), 1200)
    const hideTimer = window.setTimeout(() => setShowNudge(false), 7600)
    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(hideTimer)
    }
  }, [expanded, isDragging, pathname, showSelector, variant])

  useEffect(() => {
    if (
      !variant
      || showSelector
      || expanded
      || isDragging
      || isListening
      || isThinking
      || isSpeaking
    ) {
      setAmbientCurious(false)
      return
    }

    let resetTimer: number | null = null
    const lookTimer = window.setTimeout(() => {
      setAmbientCurious(true)
      resetTimer = window.setTimeout(() => setAmbientCurious(false), 1800)
    }, 8500 + Math.random() * 6500)

    return () => {
      window.clearTimeout(lookTimer)
      if (resetTimer) window.clearTimeout(resetTimer)
    }
  }, [expanded, isDragging, isListening, isSpeaking, isThinking, pathname, showSelector, variant])

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current)
      if (poseTimerRef.current) window.clearTimeout(poseTimerRef.current)
      recognitionRef.current?.abort()
      requestAbortRef.current?.abort()
    }
  }, [])

  function savePosition(nextPosition: MiraPosition) {
    const stage = getStageSize()
    const minX = 12
    const minY = window.innerWidth >= 768 ? 100 : 92
    const maxX = Math.max(minX, window.innerWidth - stage.width - 12)
    const maxY = Math.max(minY, window.innerHeight - stage.height - 12)

    try {
      window.localStorage.setItem(
        POSITION_STORAGE_KEY,
        JSON.stringify({
          xRatio: maxX === minX ? 0 : (nextPosition.x - minX) / (maxX - minX),
          yRatio: maxY === minY ? 0 : (nextPosition.y - minY) / (maxY - minY),
        }),
      )
    } catch {
      // The position remains valid for the current visit.
    }
  }

  function chooseVariant() {
    setVariant(pendingVariant)
    setShowSelector(false)
    setShowNudge(true)
    try {
      window.localStorage.setItem(VARIANT_STORAGE_KEY, pendingVariant)
    } catch {
      // Keep the selected avatar for the current visit.
    }
  }

  function openSelector() {
    if (variant) setPendingVariant(variant)
    setExpanded(false)
    setShowNudge(false)
    setShowSelector(true)
  }

  function speakReply(text: string) {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "it-IT"
    utterance.rate = 0.98
    utterance.pitch = 1.04
    window.speechSynthesis.speak(utterance)
  }

  async function askMira(rawMessage: string, voiceRequest = false) {
    const cleanMessage = rawMessage.trim()
    if (!cleanMessage || requestInFlightRef.current) return

    if (poseTimerRef.current) window.clearTimeout(poseTimerRef.current)
    requestAbortRef.current?.abort()
    const controller = new AbortController()
    requestAbortRef.current = controller
    requestInFlightRef.current = true
    setExpanded(true)
    setShowNudge(false)
    setInput("")
    setIsThinking(true)
    setIsSpeaking(false)
    setReply({ text: "Un attimo, ci penso io…" })

    const fallbackReply = getMiraLocalReply(cleanMessage, {
      pathname,
      lastIntent: lastLocalIntentRef.current,
      lastProductId: lastLocalProductRef.current,
    })
    lastLocalIntentRef.current = fallbackReply.intent
    if (fallbackReply.productId) lastLocalProductRef.current = fallbackReply.productId
    let nextReply: MiraReply = fallbackReply
    const timeout = window.setTimeout(() => controller.abort(), 17_000)

    try {
      const [response] = await Promise.all([
        fetch("/api/mira", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: cleanMessage,
            pathname,
            history: conversationRef.current,
          }),
          signal: controller.signal,
        }),
        new Promise((resolve) => window.setTimeout(resolve, 520)),
      ])

      if (response.ok) {
        const payload = await response.json() as MiraApiResponse
        if (payload.reply?.trim()) {
          nextReply = {
            text: payload.reply.trim(),
            href: payload.href,
            label: payload.label,
          }
        }
      }
    } catch {
      // The local guide remains available if the AI service is unavailable.
    } finally {
      window.clearTimeout(timeout)
      requestInFlightRef.current = false
      requestAbortRef.current = null

      const updatedConversation: MiraTurn[] = [
        ...conversationRef.current,
        { role: "user", content: cleanMessage },
        { role: "assistant", content: nextReply.text },
      ]
      conversationRef.current = updatedConversation.slice(-6)

      setReply(nextReply)
      setIsThinking(false)
      setIsSpeaking(true)
      if (voiceRequest) speakReply(nextReply.text)

      poseTimerRef.current = window.setTimeout(() => setIsSpeaking(false), 5200)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    askMira(input)
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setReply({ text: "Il microfono vocale non è supportato da questo browser. Puoi scrivermi qui sotto." })
      return
    }

    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.lang = "it-IT"
    recognition.interimResults = true
    recognition.continuous = false
    let finalTranscript = ""

    recognition.onstart = () => {
      setExpanded(true)
      setShowNudge(false)
      setIsListening(true)
      setIsSpeaking(false)
      setReply({ text: "Ti ascolto… parla pure." })
    }

    recognition.onresult = (event) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript
        if (event.results[index].isFinal) finalTranscript += event.results[index][0].transcript
      }
      setInput(transcript.trim())
    }

    recognition.onerror = () => {
      finalTranscript = ""
      setIsListening(false)
      setReply({ text: "Non ti ho sentito bene. Riprova oppure scrivimi la richiesta." })
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      if (finalTranscript.trim()) askMira(finalTranscript, true)
    }

    recognition.start()
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      dragging: false,
    }

    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = window.setTimeout(() => {
      dragRef.current.dragging = true
      suppressClickRef.current = true
      setIsDragging(true)
      setLookOffset({ x: 0, y: 0 })
      setExpanded(false)
      setShowNudge(false)
      navigator.vibrate?.(18)
    }, 360)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return

    if (!drag.dragging) {
      if (event.pointerType === "mouse") {
        const rect = event.currentTarget.getBoundingClientRect()
        setLookOffset({
          x: ((event.clientX - rect.left) / rect.width - 0.5) * 6,
          y: ((event.clientY - rect.top) / rect.height - 0.5) * 4,
        })
      }

      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
      if (distance > 10 && holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }
      return
    }

    event.preventDefault()
    const next = clampPosition({
      x: event.clientX - drag.offsetX,
      y: event.clientY - drag.offsetY,
    })
    positionRef.current = next
    setPosition(next)
  }

  function finishPointer(event: ReactPointerEvent<HTMLButtonElement>) {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (dragRef.current.pointerId === event.pointerId && dragRef.current.dragging) {
      savePosition(positionRef.current)
      suppressClickRef.current = true
    }

    dragRef.current.dragging = false
    dragRef.current.pointerId = -1
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleCharacterClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setReply({ text: "Yo, dimmi pure. Che cosa cerchi?" })
    setShowNudge(false)
    setExpanded(true)
  }

  function closeBubble() {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
    setIsThinking(false)
    setIsSpeaking(false)
    setExpanded(false)
  }

  if (!hydrated) return null

  const activeVariant = variant || pendingVariant
  const stageSize = getStageSize()
  const bubbleOnLeft = position.x + stageSize.width / 2 > viewportWidth / 2
  const bubbleWidth = Math.min(expanded ? 320 : 232, viewportWidth - 24)
  const estimatedBubbleHeight = expanded ? 294 : 118
  const compactViewport = viewportWidth < 640
  const bubbleLeft = Math.min(
    viewportWidth - bubbleWidth - 12,
    Math.max(
      12,
      compactViewport
        ? position.x + stageSize.width / 2 - bubbleWidth / 2
        : bubbleOnLeft
          ? position.x - bubbleWidth - 12
          : position.x + stageSize.width + 12,
    ),
  )
  const bubbleTop = Math.min(
    viewportHeight - estimatedBubbleHeight - 12,
    Math.max(
      92,
      compactViewport
        ? position.y >= estimatedBubbleHeight + 104
          ? position.y - estimatedBubbleHeight - 12
          : position.y + stageSize.height + 12
        : position.y + stageSize.height / 2 - estimatedBubbleHeight / 2,
    ),
  )
  const currentPose: MiraPose = isDragging
    ? "dragging"
    : isListening || isThinking
      ? "listening"
      : isSpeaking || showNudge || isHovering
        ? "speaking"
        : ambientCurious
          ? "curious"
          : "idle"

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
                Tienila premuta per spostarla. Toccala per scrivere o parlare.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
          </section>
        </div>
      )}

      {variant && !showSelector && positionReady && (
        <aside
          ref={stageRef}
          className={`mira-presence ${isDragging ? "mira-is-dragging" : ""}`}
          style={{ left: position.x, top: position.y }}
          aria-label="MIRA, guida del sito"
        >
          {(expanded || showNudge) && !isDragging && (
            <section
              className={`mira-neon-bubble ${expanded ? "mira-bubble-expanded" : "mira-bubble-compact"} ${
                bubbleOnLeft ? "mira-bubble-left" : "mira-bubble-right"
              }`}
              style={{ left: bubbleLeft, top: bubbleTop, width: bubbleWidth }}
              aria-label={expanded ? "Parla con MIRA" : "Suggerimento di MIRA"}
              aria-live="polite"
            >
              {expanded ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">MIRA</p>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
                      </div>
                      <p className="mt-0.5 text-[8px] uppercase tracking-[0.13em] text-white/35">
                        {isListening ? "Ti ascolto" : isThinking ? "Ci sto pensando" : isSpeaking ? "Ti rispondo" : "Guida MIRAI"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeBubble}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label="Chiudi MIRA"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="px-4 pb-3 pt-3.5">
                    <div className="min-h-16 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-3 text-[12px] leading-5 text-white/78">
                      <p>{reply.text}</p>
                      {reply.href && reply.label && (
                        <Link
                          href={reply.href}
                          onClick={() => setExpanded(false)}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-white"
                        >
                          {reply.label} <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {isListening && (
                      <div className="mira-voice-wave my-2.5 flex h-5 items-center justify-center gap-1" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((bar) => <span key={bar} style={{ animationDelay: `${bar * 90}ms` }} />)}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-black/25 p-1.5 focus-within:border-primary/60">
                      <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={isListening ? "Ti ascolto…" : "Chiedi qualcosa a MIRA…"}
                        maxLength={240}
                        className="h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/30"
                        aria-label="Richiesta per MIRA"
                      />
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!speechSupported && !isListening}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                          isListening
                            ? "bg-red-500/90 text-white shadow-[0_0_18px_rgba(239,68,68,0.45)]"
                            : "bg-white/[0.07] text-white/55 hover:bg-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-25"
                        }`}
                        aria-label={isListening ? "Ferma ascolto" : "Parla con MIRA"}
                        title={speechSupported ? "Parla con MIRA" : "Microfono non supportato da questo browser"}
                      >
                        {speechSupported ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/25"
                        aria-label="Invia richiesta a MIRA"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>

                    <p className="mt-2 flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-white/28">
                      <Move className="h-3 w-3" /> Tieni premuto MIRA per spostarla
                    </p>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowNudge(false)
                    setExpanded(true)
                  }}
                  className="block w-full p-3.5 text-left"
                >
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.22em] text-primary">MIRA</span>
                  <span className="mt-1.5 block pr-3 text-[13px] font-medium leading-5 text-white/90">{contextualPrompt}</span>
                  <span className="mt-2 block text-[8px] uppercase tracking-[0.14em] text-white/35">Tocca per chiedere</span>
                </button>
              )}
            </section>
          )}

          {isDragging && (
            <div className="mira-drag-label absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/35 bg-[#120c19]/90 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-white shadow-[0_0_24px_rgba(159,134,255,0.3)]">
              Sposta MIRA
            </div>
          )}

          <button
            type="button"
            onClick={handleCharacterClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => {
              setIsHovering(false)
              if (!isDragging) setLookOffset({ x: 0, y: 0 })
            }}
            className="mira-character-button group relative block touch-none select-none rounded-[45%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Apri MIRA. Tieni premuto per spostarla"
          >
            <span className="absolute inset-x-[12%] bottom-[6%] h-14 rounded-full border border-primary/22 bg-[#120c19]/45 shadow-[0_0_38px_rgba(159,134,255,0.34)] backdrop-blur-sm transition-all group-hover:border-primary/55 group-hover:shadow-[0_0_54px_rgba(159,134,255,0.55)]" />
            <div
              className="mira-model-reactive-shell"
              style={{ transform: `translate3d(${lookOffset.x}px, ${lookOffset.y}px, 0)` }}
            >
              <MiraModel variant={activeVariant} pose={currentPose} faceRight={!bubbleOnLeft} />
            </div>
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-black/70 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
              {isListening ? "ASCOLTO" : "MIRA"}
            </span>
          </button>

          <button
            type="button"
            onClick={openSelector}
            className="mira-avatar-switch absolute -bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-[#120c19]/85 text-white/45 shadow-[0_0_18px_rgba(159,134,255,0.2)] backdrop-blur-md transition-all hover:border-primary/60 hover:text-white"
            aria-label="Cambia avatar MIRA"
          >
            <UserRoundCog className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}
    </div>
  )
}
