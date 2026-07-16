"use client"

import Image from "next/image"
import {
  Check,
  ImagePlus,
  Loader2,
  Maximize2,
  Move,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Type,
  Upload,
} from "lucide-react"
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react"
import { useCart } from "@/lib/cart-context"
import {
  CUSTOM_TEE_IMAGE,
  CUSTOM_TEE_PRICE,
  CUSTOM_TEE_PRODUCT_ID,
  type CustomDesignMode,
  type CustomFont,
  type CustomPrintSide,
  sanitizeCustomization,
} from "@/lib/customization"

type GarmentColor = {
  name: string
  hex: string
  filter: string
  ring: string
}

const GARMENT_COLORS: GarmentColor[] = [
  { name: "Void Black", hex: "#111014", filter: "brightness(0.12) contrast(1.35)", ring: "#2b2830" },
  { name: "Bone White", hex: "#eeeae1", filter: "brightness(0.96) sepia(0.08)", ring: "#eeeae1" },
  { name: "Asphalt", hex: "#46444b", filter: "brightness(0.4) contrast(1.15)", ring: "#66636d" },
  { name: "Electric Purple", hex: "#6d35d4", filter: "brightness(0.46) sepia(1) saturate(5.2) hue-rotate(226deg)", ring: "#8654ee" },
]

const TEXT_COLORS = ["#ffffff", "#0d0c10", "#9f86ff", "#d7ff3f", "#ff4fa1"]
const SIZES = ["S", "M", "L", "XL", "XXL"]

const FONT_OPTIONS: Array<{ id: CustomFont; label: string; family: string }> = [
  { id: "grotesk", label: "Impact", family: "var(--font-space-grotesk), sans-serif" },
  { id: "serif", label: "Editorial", family: "Georgia, serif" },
  { id: "mono", label: "Terminal", family: "ui-monospace, SFMono-Regular, monospace" },
]

function SectionLabel({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-[9px] font-bold text-primary">
        {step}
      </span>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">{children}</h3>
    </div>
  )
}

function RangeControl({
  label,
  value,
  minimum,
  maximum,
  icon,
  onChange,
}: {
  label: string
  value: number
  minimum: number
  maximum: number
  icon: React.ReactNode
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
        <span className="flex items-center gap-1.5">{icon}{label}</span>
        <span className="font-mono text-primary">{value}</span>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="custom-lab-range w-full accent-primary"
      />
    </label>
  )
}

export function CustomTeeEditor() {
  const { addItem } = useCart()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const localPreviewRef = useRef<string | null>(null)
  const [garmentColor, setGarmentColor] = useState(GARMENT_COLORS[0])
  const [side, setSide] = useState<CustomPrintSide>("front")
  const [mode, setMode] = useState<CustomDesignMode>("text")
  const [customText, setCustomText] = useState("MIRAI LAB")
  const [textColor, setTextColor] = useState("#ffffff")
  const [font, setFont] = useState<CustomFont>("grotesk")
  const [size, setSize] = useState("M")
  const [scale, setScale] = useState(100)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState("")

  const shirtImage = side === "front" ? CUSTOM_TEE_IMAGE : "/custom/custom-tee-back.png"
  const selectedFont = FONT_OPTIONS.find((option) => option.id === font) || FONT_OPTIONS[0]
  const designReady = mode === "text" ? Boolean(customText.trim()) : Boolean(uploadedUrl) && !uploading
  const designPreview = mode === "image" ? previewUrl || uploadedUrl : ""

  const editorStatus = useMemo(() => {
    if (uploading) return "Sto preparando la grafica…"
    if (mode === "image" && !uploadedUrl) return "Carica una grafica per completare il progetto"
    return "Progetto pronto per il carrello"
  }, [mode, uploadedUrl, uploading])

  useEffect(() => {
    setAdded(false)
  }, [customText, font, garmentColor, mode, positionX, positionY, scale, side, size, textColor, uploadedUrl])

  useEffect(() => () => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
  }, [])

  function resetPlacement() {
    setScale(100)
    setPositionX(0)
    setPositionY(0)
  }

  function applyTextPreset(text: string, nextFont: CustomFont, nextColor: string) {
    setMode("text")
    setCustomText(text)
    setFont(nextFont)
    setTextColor(nextColor)
    resetPlacement()
  }

  async function uploadArtwork(file: File) {
    setUploadError("")
    setAdded(false)

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type)) {
      setUploadError("Formato non supportato. Usa PNG, JPG, WebP o AVIF.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La grafica supera 5 MB. Riducila e riprova.")
      return
    }

    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
    const localUrl = URL.createObjectURL(file)
    localPreviewRef.current = localUrl
    setPreviewUrl(localUrl)
    setUploadedUrl("")
    setMode("image")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      const payload = await response.json() as { url?: string; error?: string }
      if (!response.ok || !payload.url) throw new Error(payload.error || "Upload non riuscito")
      setUploadedUrl(payload.url)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Non riesco a caricare la grafica")
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadArtwork(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadArtwork(file)
  }

  function addCustomTee() {
    setCartError("")
    setAdded(false)
    const designId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const customization = sanitizeCustomization({
      designId,
      color: garmentColor.name,
      colorHex: garmentColor.hex,
      side,
      mode,
      text: customText,
      textColor,
      font,
      imageUrl: uploadedUrl,
      scale,
      positionX,
      positionY,
    })

    if (!customization) {
      setCartError(mode === "image" ? "Attendi il caricamento della grafica." : "Inserisci un testo per la stampa.")
      return
    }

    addItem({
      productId: CUSTOM_TEE_PRODUCT_ID,
      lineId: designId,
      name: "MIRAI Custom Heavy Tee",
      price: CUSTOM_TEE_PRICE,
      image_url: shirtImage,
      size,
      customization,
    })
    setAdded(true)
    window.setTimeout(() => window.dispatchEvent(new Event("mirai:open-cart")), 350)
  }

  return (
    <div id="editor" className="scroll-mt-36">
      <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0a12]/90 shadow-[0_40px_120px_rgba(0,0,0,0.5)] lg:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)]">
        <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 bg-[#100b18] p-5 sm:p-8 lg:min-h-[760px] lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(130,72,255,0.22),transparent_42%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">Live preview</p>
              <p className="mt-1 text-xs text-white/45">{side === "front" ? "Fronte" : "Retro"} · {garmentColor.name}</p>
            </div>
            <div className="flex rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-md">
              {(["front", "back"] as CustomPrintSide[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSide(item)}
                  className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] transition-all ${side === item ? "bg-primary text-white shadow-[0_0_22px_rgba(159,134,255,0.45)]" : "text-white/40 hover:text-white"}`}
                >
                  {item === "front" ? "Fronte" : "Retro"}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-3 aspect-square w-full max-w-[680px]">
            <div className="custom-tee-halo absolute inset-[10%] rounded-full bg-primary/20 blur-[70px]" />
            <Image
              key={shirtImage}
              src={shirtImage}
              alt={`MIRAI Custom Heavy Tee, vista ${side === "front" ? "frontale" : "posteriore"}`}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 94vw"
              className="custom-tee-switch select-none object-contain"
              style={{ filter: garmentColor.filter }}
              draggable={false}
            />

            <div
              className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center overflow-hidden rounded-sm border border-dashed border-primary/35 bg-primary/[0.025] ${side === "front" ? "top-[29%] h-[36%] w-[24%]" : "top-[27%] h-[40%] w-[27%]"}`}
              aria-label="Area di stampa"
            >
              <div
                className="flex h-full w-full items-center justify-center p-1 transition-transform duration-200"
                style={{ transform: `translate(${positionX * 0.65}%, ${positionY * 0.65}%) scale(${scale / 100})` }}
              >
                {mode === "text" ? (
                  <span
                    className="max-w-full whitespace-pre-wrap break-words text-center text-[clamp(9px,2.4vw,30px)] font-black uppercase leading-[0.88] tracking-[-0.06em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    style={{ color: textColor, fontFamily: selectedFont.family }}
                  >
                    {customText || "IL TUO TESTO"}
                  </span>
                ) : designPreview ? (
                  // A normal img supports both local blob previews and uploaded remote URLs.
                  <img src={designPreview} alt="Grafica caricata" className="h-full w-full object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-primary/30" />
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-2 flex max-w-lg items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] text-white/45">
              <span className={`h-2 w-2 rounded-full ${designReady ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-amber-400 shadow-[0_0_10px_#fbbf24]"}`} />
              {editorStatus}
            </div>
            <button type="button" onClick={resetPlacement} className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </section>

        <section className="bg-[#15111b] p-5 sm:p-7 lg:max-h-[760px] lg:overflow-y-auto">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">MIRAI Custom Lab</p>
              <h2 className="mt-2 text-xl font-bold uppercase tracking-[-0.03em] text-white sm:text-2xl">Crea il tuo pezzo</h2>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">Prezzo</p>
              <p className="mt-1 text-2xl font-bold text-white">{CUSTOM_TEE_PRICE} €</p>
            </div>
          </div>

          <div className="space-y-7">
            <div>
              <SectionLabel step="01">Colore del capo</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {GARMENT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setGarmentColor(color)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${garmentColor.name === color.name ? "border-primary/70 bg-primary/10 text-white" : "border-white/10 bg-white/[0.025] text-white/50 hover:border-white/25"}`}
                  >
                    <span className="h-5 w-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color.ring }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel step="02">Tipo di design</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setMode("text")} className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${mode === "text" ? "border-primary bg-primary text-white" : "border-white/10 text-white/45 hover:text-white"}`}>
                  <Type className="h-4 w-4" /> Testo
                </button>
                <button type="button" onClick={() => setMode("image")} className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${mode === "image" ? "border-primary bg-primary text-white" : "border-white/10 text-white/45 hover:text-white"}`}>
                  <ImagePlus className="h-4 w-4" /> Grafica
                </button>
              </div>

              {mode === "text" ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => applyTextPreset("MIRAI LAB", "grotesk", "#ffffff")} className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-2 text-[9px] uppercase tracking-[0.08em] text-white/55 hover:border-primary/50 hover:text-white">Core</button>
                    <button type="button" onClick={() => applyTextPreset("NO SIGNAL", "mono", "#d7ff3f")} className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-2 text-[9px] uppercase tracking-[0.08em] text-white/55 hover:border-primary/50 hover:text-white">No Signal</button>
                    <button type="button" onClick={() => applyTextPreset("FUTURE IS NOW", "serif", "#9f86ff")} className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-2 text-[9px] uppercase tracking-[0.08em] text-white/55 hover:border-primary/50 hover:text-white">Future</button>
                  </div>
                  <label className="block">
                    <span className="sr-only">Testo personalizzato</span>
                    <input
                      value={customText}
                      onChange={(event) => setCustomText(event.target.value.slice(0, 40))}
                      placeholder="Scrivi il tuo messaggio"
                      className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm uppercase text-white outline-none transition-colors placeholder:text-white/25 focus:border-primary"
                    />
                    <span className="mt-1.5 block text-right font-mono text-[9px] text-white/25">{customText.length}/40</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map((option) => (
                      <button key={option.id} type="button" onClick={() => setFont(option.id)} className={`rounded-lg border px-2 py-2 text-[10px] transition-colors ${font === option.id ? "border-primary/70 bg-primary/10 text-white" : "border-white/10 text-white/40"}`} style={{ fontFamily: option.family }}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {TEXT_COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => setTextColor(color)} aria-label={`Colore testo ${color}`} className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${textColor === color ? "scale-110 border-primary" : "border-white/15"}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`mt-3 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragActive ? "border-primary bg-primary/10" : "border-white/15 bg-black/15 hover:border-primary/50"}`}
                  onDragOver={(event) => { event.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={handleFileChange} className="hidden" />
                  {uploading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> : <Upload className="mx-auto h-6 w-6 text-primary" />}
                  <p className="mt-2 text-xs font-medium text-white">{uploading ? "Caricamento in corso…" : uploadedUrl ? "Grafica caricata" : "Trascina qui la tua grafica"}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/30">PNG, JPG, WebP · max 5 MB</p>
                  <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="mt-3 rounded-full border border-primary/45 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50">
                    {uploadedUrl ? "Cambia file" : "Scegli file"}
                  </button>
                  {uploadError && <p className="mt-3 text-[10px] text-red-400">{uploadError}</p>}
                </div>
              )}
            </div>

            <div>
              <SectionLabel step="03">Posizione e dimensione</SectionLabel>
              <div className="grid gap-4 rounded-xl border border-white/10 bg-black/15 p-4">
                <RangeControl label="Dimensione" value={scale} minimum={55} maximum={145} icon={<Maximize2 className="h-3 w-3" />} onChange={setScale} />
                <div className="grid grid-cols-2 gap-4">
                  <RangeControl label="Orizzontale" value={positionX} minimum={-40} maximum={40} icon={<Move className="h-3 w-3" />} onChange={setPositionX} />
                  <RangeControl label="Verticale" value={positionY} minimum={-40} maximum={40} icon={<Move className="h-3 w-3 rotate-90" />} onChange={setPositionY} />
                </div>
              </div>
            </div>

            <div>
              <SectionLabel step="04">Scegli la taglia</SectionLabel>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((item) => (
                  <button key={item} type="button" onClick={() => setSize(item)} className={`rounded-lg border py-2.5 text-[10px] font-bold transition-colors ${size === item ? "border-primary bg-primary text-white" : "border-white/10 text-white/45 hover:text-white"}`}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[9px] leading-relaxed text-white/30">Fit oversize heavyweight. Scegli la tua taglia abituale.</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center justify-between text-[10px] text-white/40">
              <span>Heavy Tee + 1 stampa inclusa</span>
              <span className="font-semibold text-white">{CUSTOM_TEE_PRICE},00 €</span>
            </div>
            <button
              type="button"
              disabled={!designReady}
              onClick={addCustomTee}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_34px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4 transition-transform group-hover:-rotate-6" />}
              {added ? "Aggiunta al carrello" : "Ordina la tua Custom Tee"}
            </button>
            {cartError && <p className="mt-2 text-center text-[10px] text-red-400">{cartError}</p>}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] uppercase tracking-[0.12em] text-white/25">
              <Sparkles className="h-3 w-3 text-primary" /> Anteprima indicativa · Controllo manuale prima della stampa
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
