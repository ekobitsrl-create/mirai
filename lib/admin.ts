const ADMIN_EMAILS = new Set([
  "admin@mirai.store",
  "mattyventura02@gmail.com",
])

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase())
}
