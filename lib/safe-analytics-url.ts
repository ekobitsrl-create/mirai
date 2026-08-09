const SENSITIVE_QUERY_KEYS = new Set([
  "access_token",
  "code",
  "confirmation_token",
  "order_id",
  "refresh_token",
  "session_id",
  "token",
])

export function sanitizedAnalyticsUrl(input: string | URL) {
  const url = typeof input === "string" ? new URL(input, window.location.origin) : new URL(input)
  for (const key of [...url.searchParams.keys()]) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) url.searchParams.delete(key)
  }
  url.hash = ""
  return url
}

export function sanitizedAnalyticsPath(input: string | URL) {
  const url = sanitizedAnalyticsUrl(input)
  return `${url.pathname}${url.search}`
}
