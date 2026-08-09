import type { SupabaseClient, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"
import { createUnsubscribeToken } from "@/lib/email/abandoned-cart"
import { sendEmailSafely } from "@/lib/email/resend"
import { welcomeCouponTemplate } from "@/lib/email/templates"

export const WELCOME_COUPON_CODE = "MIRACON15"
export const WELCOME_COUPON_VALIDITY_DAYS = 7

const SEND_DELAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 200
const MAX_EMAILS_PER_RUN = 50
const EVENT_PREFIX = "welcome-miracon15-"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hasSignupMarketingConsent(user: User) {
  return user.user_metadata?.marketing_consent === true
    && typeof user.user_metadata?.marketing_consent_at === "string"
}

async function listRegisteredUsers(supabase: SupabaseClient) {
  const users: User[] = []

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
    if (error) throw error

    const rows = data.users || []
    users.push(...rows)
    if (rows.length < PAGE_SIZE) break
  }

  return users
}

export async function sendWelcomeCouponEmails(options: { dryRun?: boolean } = {}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Chiave Supabase amministrativa non configurata")
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY non configurata")
  }

  const supabase = await createClient()
  const [users, ordersResult, consentResult, unsubscribesResult, deliveriesResult, profilesResult] = await Promise.all([
    listRegisteredUsers(supabase),
    supabase.from("orders").select("email, status"),
    supabase.from("abandoned_checkouts").select("email, consent_at"),
    supabase.from("email_unsubscribes").select("email"),
    supabase.from("email_deliveries").select("event_key").like("event_key", `${EVENT_PREFIX}%`).eq("status", "sent"),
    supabase.from("profiles").select("id, role").eq("role", "admin"),
  ])

  const firstError = [
    ordersResult.error,
    consentResult.error,
    unsubscribesResult.error,
    deliveriesResult.error,
    profilesResult.error,
  ].find(Boolean)
  if (firstError) throw firstError

  const buyerEmails = new Set(
    (ordersResult.data || [])
      .filter((order) => order.status !== "cancelled")
      .map((order) => normalizeEmail(order.email || ""))
      .filter(Boolean),
  )
  const checkoutConsentEmails = new Set(
    (consentResult.data || [])
      .map((row) => normalizeEmail(row.email || ""))
      .filter(Boolean),
  )
  const unsubscribedEmails = new Set(
    (unsubscribesResult.data || [])
      .map((row) => normalizeEmail(row.email || ""))
      .filter(Boolean),
  )
  const sentEvents = new Set((deliveriesResult.data || []).map((row) => row.event_key))
  const adminIds = new Set((profilesResult.data || []).map((profile) => profile.id))
  const cutoff = Date.now() - SEND_DELAY_MS

  const eligibleUsers = users
    .filter((user) => {
      if (!user.email || !user.email_confirmed_at || adminIds.has(user.id)) return false
      const email = normalizeEmail(user.email)
      const hasConsent = hasSignupMarketingConsent(user) || checkoutConsentEmails.has(email)
      return hasConsent
        && new Date(user.created_at).getTime() <= cutoff
        && !buyerEmails.has(email)
        && !unsubscribedEmails.has(email)
        && !sentEvents.has(`${EVENT_PREFIX}${user.id}`)
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, MAX_EMAILS_PER_RUN)

  if (options.dryRun) {
    return {
      registered: users.length,
      eligible: eligibleUsers.length,
      sent: 0,
      dryRun: true,
    }
  }

  let sent = 0
  for (const user of eligibleUsers) {
    const email = normalizeEmail(user.email!)
    const token = createUnsubscribeToken(email)
    if (!token) continue

    const unsubscribeUrl = `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`
    const result = await sendEmailSafely({
      ...welcomeCouponTemplate(unsubscribeUrl),
      to: email,
      eventKey: `${EVENT_PREFIX}${user.id}`,
      category: "marketing",
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    })

    if (result.sent && !("duplicate" in result && result.duplicate)) sent += 1
  }

  return {
    registered: users.length,
    eligible: eligibleUsers.length,
    sent,
    dryRun: false,
  }
}
