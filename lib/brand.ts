export const MIRAI_WORDMARK = "MIRΛI"
export const MIRA_WORDMARK = "MIRΛ"

/**
 * Applies the MIRAI crossbar-free A only to brand names that are shown in the UI.
 * Technical identifiers, URLs and persisted product data keep the canonical spelling.
 */
export function stylizeBrandText(value: string) {
  return value
    .replace(/\bMIRAI\b/g, MIRAI_WORDMARK)
    .replace(/\bMirai\b/g, "MirΛi")
    .replace(/\bMIRA\b/g, MIRA_WORDMARK)
    .replace(/\bMira\b/g, "MirΛ")
}
