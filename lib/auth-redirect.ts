const INTERNAL_ORIGIN = "https://www.mirailabstore.com"

export function safeNextPath(value: unknown, fallback = "/community/hub"): string {
  if (typeof value !== "string" || value.length > 500 || !value.startsWith("/")) return fallback
  // Browsers normalize backslashes and strip control characters before navigating.
  if (/[\\\u0000-\u0020\u007f]/.test(value) || /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return fallback
  try {
    const url = new URL(value, INTERNAL_ORIGIN)
    if (url.origin !== INTERNAL_ORIGIN || url.pathname.startsWith("//")) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
