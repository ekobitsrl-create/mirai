const ADMIN_EMAILS = new Set([
  "mirailabstore@gmail.com",
  "mattyventura02@gmail.com",
])

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase())
}
