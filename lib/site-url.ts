const DEFAULT_SITE_URL = "https://www.mirailabstore.com"
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"])

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim()
  if (!candidate) return DEFAULT_SITE_URL

  try {
    const url = new URL(candidate)
    if (!["http:", "https:"].includes(url.protocol)) return DEFAULT_SITE_URL
    if (process.env.NODE_ENV === "production" && LOCAL_HOSTNAMES.has(url.hostname)) {
      return DEFAULT_SITE_URL
    }
    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL,
)

export function getAbsoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}
