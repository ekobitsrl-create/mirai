export const CUSTOM_TEE_PRODUCT_ID = "mirai-custom-heavy-tee"
export const CUSTOM_TEE_PRICE = 79
export const CUSTOM_TEE_IMAGE = "/custom/custom-tee-base.png"

export type CustomDesignMode = "text" | "image"
export type CustomPrintSide = "front" | "back"
export type CustomFont = "grotesk" | "serif" | "mono"

export type CustomizationDetails = {
  designId: string
  color: string
  colorHex: string
  side: CustomPrintSide
  mode: CustomDesignMode
  text?: string
  textColor?: string
  font?: CustomFont
  imageUrl?: string
  scale: number
  positionX: number
  positionY: number
}

const ALLOWED_COLORS = new Set(["Void Black", "Bone White", "Asphalt", "Electric Purple"])
const ALLOWED_FONTS = new Set<CustomFont>(["grotesk", "serif", "mono"])

function clampNumber(value: unknown, minimum: number, maximum: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)))
}

function cleanText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return ""
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximumLength)
}

function cleanImageUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return ""
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : ""
  } catch {
    return ""
  }
}

export function sanitizeCustomization(value: unknown): CustomizationDetails | null {
  if (!value || typeof value !== "object") return null
  const candidate = value as Record<string, unknown>
  const designId = cleanText(candidate.designId, 64).replace(/[^a-zA-Z0-9-]/g, "")
  const color = cleanText(candidate.color, 30)
  const colorHex = cleanText(candidate.colorHex, 7)
  const side: CustomPrintSide = candidate.side === "back" ? "back" : "front"
  const mode: CustomDesignMode = candidate.mode === "image" ? "image" : "text"
  const font = ALLOWED_FONTS.has(candidate.font as CustomFont)
    ? candidate.font as CustomFont
    : "grotesk"
  const text = cleanText(candidate.text, 40)
  const textColor = cleanText(candidate.textColor, 7)
  const imageUrl = cleanImageUrl(candidate.imageUrl)

  if (!designId || !ALLOWED_COLORS.has(color) || !/^#[0-9a-fA-F]{6}$/.test(colorHex)) return null
  if (mode === "text" && !text) return null
  if (mode === "image" && !imageUrl) return null

  return {
    designId,
    color,
    colorHex,
    side,
    mode,
    ...(mode === "text" ? { text, textColor: /^#[0-9a-fA-F]{6}$/.test(textColor) ? textColor : "#ffffff", font } : {}),
    ...(mode === "image" ? { imageUrl } : {}),
    scale: clampNumber(candidate.scale, 55, 145, 100),
    positionX: clampNumber(candidate.positionX, -40, 40, 0),
    positionY: clampNumber(candidate.positionY, -40, 40, 0),
  }
}

export function customizationSummary(customization: CustomizationDetails) {
  const side = customization.side === "front" ? "Fronte" : "Retro"
  const design = customization.mode === "text"
    ? `Testo: ${customization.text}`
    : "Grafica caricata"
  return `${customization.color} · ${side} · ${design}`
}

export function customizationMetadata(customization: CustomizationDetails) {
  return {
    mirai_custom: "true",
    design_id: customization.designId,
    color: `${customization.color} (${customization.colorHex})`,
    print_side: customization.side,
    design_mode: customization.mode,
    design_content: customization.mode === "text" ? customization.text || "" : customization.imageUrl || "",
    text_style: customization.mode === "text"
      ? `${customization.font || "grotesk"} ${customization.textColor || "#ffffff"}`
      : "",
    placement: `scale:${customization.scale};x:${customization.positionX};y:${customization.positionY}`,
  }
}
