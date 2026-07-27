import { createHmac, timingSafeEqual } from "node:crypto"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/site-url"
import { sendEmailSafely } from "@/lib/email/resend"
import { abandonedCartTemplate, type AbandonedCartItem } from "@/lib/email/templates"

type AbandonedCheckoutRow = {
  id: string
  email: string
  items: AbandonedCartItem[]
}

function emailSecret() {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim() || process.env.CRON_SECRET?.trim() || ""
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function sanitizeItems(items: AbandonedCartItem[]) {
  return items.slice(0, 25).map((item) => ({
    name: String(item.name || "Prodotto MIRAI").slice(0, 180),
    quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
    price: Math.max(0, Number(item.price) || 0),
    image: item.image ? String(item.image).slice(0, 1000) : null,
    size: item.size ? String(item.size).slice(0, 40) : null,
  }))
}

export function createUnsubscribeToken(email: string) {
  const secret = emailSecret()
  if (!secret) return null

  const payload = Buffer.from(normalizeEmail(email), "utf8").toString("base64url")
  const signature = createHmac("sha256", secret).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

export function readUnsubscribeToken(token: string) {
  try {
    const secret = emailSecret()
    const [payload, signature] = token.split(".")
    if (!secret || !payload || !signature) return null

    const expected = createHmac("sha256", secret).update(payload).digest()
    const received = Buffer.from(signature, "base64url")
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

    const email = Buffer.from(payload, "base64url").toString("utf8")
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? normalizeEmail(email) : null
  } catch {
    return null
  }
}

export async function saveAbandonedCheckout(input: {
  checkoutSessionId: string
  email: string
  items: AbandonedCartItem[]
  consent: boolean
}) {
  if (!input.consent || !process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("abandoned_checkouts").upsert({
      checkout_session_id: input.checkoutSessionId,
      email: normalizeEmail(input.email),
      items: sanitizeItems(input.items),
      status: "active",
      consent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "checkout_session_id" })

    if (error) throw error
  } catch (error) {
    console.warn("Promemoria carrello non registrato", error)
  }
}

export async function markCheckoutRecovered(input: {
  checkoutSessionId?: string | null
  email?: string | null
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const supabase = await createClient()
    let query = supabase
      .from("abandoned_checkouts")
      .update({ status: "recovered", updated_at: new Date().toISOString() })
      .in("status", ["active", "reminded"])

    if (input.checkoutSessionId) {
      query = query.eq("checkout_session_id", input.checkoutSessionId)
    } else if (input.email) {
      query = query.eq("email", normalizeEmail(input.email))
    } else {
      return
    }

    const { error } = await query
    if (error) throw error
  } catch (error) {
    console.warn("Impossibile chiudere il promemoria carrello", error)
  }
}

export async function unsubscribeAbandonedCart(email: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Servizio disiscrizione non configurato")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("abandoned_checkouts")
    .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email))
    .in("status", ["active", "reminded"])

  if (error) throw error
}

export async function sendAbandonedCartReminders() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata")
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY non configurata")
  }
  if (!emailSecret()) {
    throw new Error("EMAIL_UNSUBSCRIBE_SECRET o CRON_SECRET non configurato")
  }

  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  const oldest = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from("abandoned_checkouts")
    .select("id, email, items")
    .eq("status", "active")
    .is("reminder_sent_at", null)
    .lte("created_at", cutoff)
    .gte("created_at", oldest)
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) throw error

  let sent = 0
  for (const row of (data || []) as AbandonedCheckoutRow[]) {
    const token = createUnsubscribeToken(row.email)
    if (!token || !Array.isArray(row.items) || row.items.length === 0) continue

    const unsubscribeUrl = `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`
    const result = await sendEmailSafely({
      ...abandonedCartTemplate(row.items, unsubscribeUrl),
      to: row.email,
      eventKey: `abandoned-cart-${row.id}`,
      category: "marketing",
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    })

    if (result.sent) {
      sent += 1
      await supabase
        .from("abandoned_checkouts")
        .update({
          status: "reminded",
          reminder_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
    }
  }

  return { scanned: data?.length || 0, sent }
}
