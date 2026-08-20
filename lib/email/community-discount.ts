import type { SupabaseClient, User } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"
import { createUnsubscribeToken } from "@/lib/email/abandoned-cart"
import { sendEmailSafely } from "@/lib/email/resend"
import {
  communityDiscountTemplate,
  type CommunityDiscountEmail,
} from "@/lib/email/templates"

const PAGE_SIZE = 200
const SEND_CONCURRENCY = 8

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hasMarketingConsent(user: User) {
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

export async function sendCommunityDiscountEmails(input: {
  campaignId: string
  discount: CommunityDiscountEmail
  subject: string
  message: string
}) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY non configurata")
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Chiave Supabase amministrativa non configurata")
  }

  const supabase = createAdminClient()
  const [users, profilesResult, unsubscribesResult] = await Promise.all([
    listRegisteredUsers(supabase),
    supabase.from("profiles").select("id, role"),
    supabase.from("email_unsubscribes").select("email"),
  ])

  if (profilesResult.error) throw profilesResult.error
  if (unsubscribesResult.error) throw unsubscribesResult.error

  const memberIds = new Set(
    (profilesResult.data || [])
      .filter((profile) => profile.role !== "admin")
      .map((profile) => profile.id),
  )
  const unsubscribedEmails = new Set(
    (unsubscribesResult.data || [])
      .map((row) => normalizeEmail(row.email || ""))
      .filter(Boolean),
  )
  const recipients = users
    .filter((user) => {
      if (!memberIds.has(user.id) || !user.email || !user.email_confirmed_at) return false
      const email = normalizeEmail(user.email)
      return hasMarketingConsent(user) && !unsubscribedEmails.has(email)
    })
    .map((user) => ({ id: user.id, email: normalizeEmail(user.email!) }))

  if (recipients.length === 0) {
    throw new Error("Nessun membro community ha email confermata e consenso marketing attivo")
  }

  let sent = 0
  let failed = 0
  let duplicate = 0

  for (let index = 0; index < recipients.length; index += SEND_CONCURRENCY) {
    const batch = recipients.slice(index, index + SEND_CONCURRENCY)
    const results = await Promise.all(batch.map(async (recipient) => {
      const token = createUnsubscribeToken(recipient.email)
      if (!token) throw new Error("EMAIL_UNSUBSCRIBE_SECRET o CRON_SECRET non configurato")

      const unsubscribeUrl = `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`
      return sendEmailSafely({
        ...communityDiscountTemplate({
          discount: input.discount,
          subject: input.subject,
          message: input.message,
          unsubscribeUrl,
        }),
        to: recipient.email,
        eventKey: `community-discount-${input.campaignId}-${recipient.id}`,
        category: "marketing",
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      })
    }))

    for (const result of results) {
      if (!result.sent) failed += 1
      else if ("duplicate" in result && result.duplicate) duplicate += 1
      else sent += 1
    }
  }

  return { eligible: recipients.length, sent, failed, duplicate }
}
