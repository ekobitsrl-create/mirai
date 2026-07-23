export type ProductTitleInput = {
  name?: string | null
  category?: string | null
  color_name?: string | null
}

type ProductKind =
  | "t-shirt"
  | "custom-t-shirt"
  | "canotta"
  | "camicia"
  | "bermuda"
  | "shorts"
  | "jeans"
  | "pantaloni"
  | "felpa"
  | "tuta"
  | "giacca"
  | "cappello"
  | "sneakers"
  | "occhiali"
  | "profumo"
  | "accessorio"
  | "generic"

const TITLE_PREFIXES: Record<ProductKind, string> = {
  "t-shirt": "T-shirt Oversize Premium Streetwear Mirai",
  "custom-t-shirt": "T-shirt Personalizzata Premium Streetwear Mirai",
  canotta: "Canotta Oversize Premium Streetwear Mirai",
  camicia: "Camicia Oversize Premium Streetwear Mirai",
  bermuda: "Bermuda Premium Streetwear Mirai",
  shorts: "Shorts Premium Streetwear Mirai",
  jeans: "Jeans Premium Streetwear Mirai",
  pantaloni: "Pantaloni Premium Streetwear Mirai",
  felpa: "Felpa Oversize Premium Streetwear Mirai",
  tuta: "Tuta Premium Streetwear Mirai",
  giacca: "Giacca Premium Streetwear Mirai",
  cappello: "Cappello Custom Premium Streetwear Mirai",
  sneakers: "Sneakers Premium Streetwear Mirai",
  occhiali: "Occhiali da Sole Premium Streetwear Mirai",
  profumo: "Extrait de Parfum Premium Mirai 100 ml",
  accessorio: "Accessorio Premium Streetwear Mirai",
  generic: "Prodotto Premium Streetwear Mirai",
}

const KNOWN_COLOR_SUFFIX =
  /(?:washed\s+|vintage\s+|light\s+)?(?:black|white|pink|sand|red|blue|brown|green|purple|yellow|orange|grey|gray|beige|nero|nera|bianco|bianca|rosa|rosso|rossa|blu|marrone|verde|viola|giallo|gialla|arancio|grigio|grigia|panna|sabbia|bordeaux)$/i

function normalizedText(value: string | null | undefined) {
  return (value || "")
    .replace(/â€“|â€”|–|—/g, " - ")
    .replace(/\s+/g, " ")
    .trim()
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function inferProductKind({ name, category }: ProductTitleInput): ProductKind {
  const productName = normalizedText(name).toLowerCase()
  const productCategory = normalizedText(category).toLowerCase()
  const identity = `${productName} ${productCategory}`

  if (includesAny(identity, ["extrait de parfum", "profumo", "profumi", "parfum", "fragrance"])) return "profumo"
  if (includesAny(identity, ["custom lab", "personalizzat"])) return "custom-t-shirt"
  if (includesAny(identity, ["canotta", "canotte", "sleeveless", "tank top"])) return "canotta"
  if (includesAny(identity, ["camicia", "camicie", "shirt oversize"])) return "camicia"
  if (includesAny(identity, ["bermuda"])) return "bermuda"
  if (includesAny(identity, ["shorts", "short"])) return "shorts"
  if (includesAny(identity, ["jeans", "denim pants"])) return "jeans"
  if (includesAny(identity, ["pantaloni", "pantalone", "pants", "cargo"])) return "pantaloni"
  if (includesAny(identity, ["tracksuit", "tuta", "tute"])) return "tuta"
  if (includesAny(identity, ["hoodie", "felpa", "felpe", "sweatshirt"])) return "felpa"
  if (includesAny(identity, ["giacca", "giacche", "jacket", "gilet", "vest"])) return "giacca"
  if (includesAny(identity, ["cappell", "hat", "cap ", "baseball cap", "yankees", "dodgers"])) return "cappello"
  if (includesAny(identity, ["scarpe", "sneaker", "shoes"])) return "sneakers"
  if (includesAny(identity, ["occhiali", "sunglasses"])) return "occhiali"
  if (includesAny(identity, ["accessori", "accessorio"])) return "accessorio"
  if (includesAny(identity, ["t-shirt", "tshirt", "tee", "maglietta"])) return "t-shirt"

  return "generic"
}

function removeTypeWords(design: string, kind: ProductKind) {
  const rules: Partial<Record<ProductKind, RegExp[]>> = {
    "t-shirt": [
      /^(?:t[\s-]?shirt|tee|maglietta)\s+/i,
      /\s+(?:t[\s-]?shirt|tee|maglietta)$/i,
    ],
    "custom-t-shirt": [
      /^(?:t[\s-]?shirt|tee|maglietta)\s+/i,
      /\s+(?:t[\s-]?shirt|tee|maglietta)$/i,
      /\s+custom\s+heavy$/i,
    ],
    canotta: [
      /^(?:canotta|sleeveless|tank\s+top)\s+/i,
      /\s+(?:canotta|sleeveless|tank\s+top)$/i,
    ],
    camicia: [
      /^camicia\s+/i,
      /\s+camicia$/i,
    ],
    bermuda: [
      /^bermuda\s+/i,
      /\s+bermuda$/i,
    ],
    shorts: [
      /^shorts?\s+/i,
      /\s+shorts?$/i,
    ],
    jeans: [
      /^jeans?\s+/i,
      /\s+jeans?$/i,
    ],
    pantaloni: [
      /^(?:pantaloni|pantalone|pants)\s+/i,
      /\s+(?:pantaloni|pantalone|pants)$/i,
    ],
    felpa: [
      /^(?:felpa|hoodie|sweatshirt)\s+/i,
      /\s+(?:felpa|hoodie|sweatshirt)$/i,
    ],
    tuta: [
      /^(?:tuta|tracksuit)\s+/i,
      /\s+(?:tuta|tracksuit)$/i,
    ],
    giacca: [
      /^(?:giacca|jacket|gilet|vest)\s+/i,
      /\s+(?:giacca|jacket|gilet|vest)$/i,
    ],
    cappello: [
      /^(?:cappello|cap|hat)\s+/i,
      /\s+(?:cappello|cap|hat)$/i,
    ],
    sneakers: [
      /^(?:scarpe|sneakers?|shoes)\s+/i,
      /\s+(?:scarpe|sneakers?|shoes)$/i,
    ],
    profumo: [
      /^(?:profumo|extrait de parfum)\s+/i,
      /\s+(?:profumo|extrait de parfum)(?:\s+100\s*ml)?$/i,
    ],
  }

  return (rules[kind] || []).reduce((value, rule) => value.replace(rule, ""), design).trim()
}

function getDesignName(input: ProductTitleInput, kind: ProductKind) {
  let design = normalizedText(input.name)
    .replace(/^(?:mirai|minimal)\s+/i, "")
    .trim()

  const alreadyNormalized = Object.values(TITLE_PREFIXES).find((prefix) =>
    design.toLowerCase().startsWith(`${prefix.toLowerCase()} - `),
  )
  if (alreadyNormalized) {
    design = design.slice(alreadyNormalized.length).replace(/^\s*-\s*/, "")
  }

  const separatorIndex = design.lastIndexOf(" - ")
  if (separatorIndex > 0) {
    const suffix = design.slice(separatorIndex + 3).trim()
    const colorName = normalizedText(input.color_name).toLowerCase()
    if (KNOWN_COLOR_SUFFIX.test(suffix) || (colorName && suffix.toLowerCase() === colorName)) {
      design = design.slice(0, separatorIndex).trim()
    }
  }

  design = removeTypeWords(design, kind)
    .replace(/^[\s\-:|]+|[\s\-:|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()

  if (["t-shirt", "canotta", "camicia", "felpa"].includes(kind)) {
    design = design.replace(/^oversize\s+/i, "").trim()
  }

  return design || normalizedText(input.category) || "Collezione"
}

/**
 * Creates a consistent, SEO-oriented catalog title while keeping the garment
 * type pertinent. The function is deliberately idempotent so it is safe to use
 * both when reading old database rows and before persisting new ones.
 */
export function getPremiumProductTitle(input: ProductTitleInput) {
  const kind = inferProductKind(input)
  const design = getDesignName(input, kind)
  return `${TITLE_PREFIXES[kind]} - ${design}`
}
