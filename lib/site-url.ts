const DEFAULT_SITE_URL = "https://www.mirailabstore.com"

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim()
  if (!candidate) return DEFAULT_SITE_URL

  try {
    return new URL(candidate).origin
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
