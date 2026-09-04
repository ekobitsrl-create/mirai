import { createAdminClient } from "@/lib/supabase/server"

export type EmailContent = {
  subject: string
  html: string
  text: string
}

type SendEmailOptions = EmailContent & {
  to: string
  eventKey: string
  category: "transactional" | "marketing"
  headers?: Record<string, string>
}

type ResendResponse = {
  id?: string
  message?: string
  name?: string
}

const DEFAULT_FROM = "MIRΛI LAB STORE <customer@mirailabstore.com>"
const DEFAULT_REPLY_TO = "info@mirailabstore.com"

function configuredSender() {
  return process.env.RESEND_FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim() || DEFAULT_FROM
}

function configuredReplyTo() {
  return process.env.RESEND_REPLY_TO?.trim() || process.env.EMAIL_REPLY_TO?.trim() || DEFAULT_REPLY_TO
}

async function recordDelivery(
  options: SendEmailOptions,
  status: "sent" | "failed",
  providerId?: string,
  error?: string,
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const supabase = createAdminClient()
    await supabase.from("email_deliveries").upsert({
      event_key: options.eventKey,
      email: options.to,
      category: options.category,
      status,
      provider_id: providerId || null,
      error: error || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "event_key" })
  } catch (recordError) {
    console.warn("Impossibile registrare lo stato email", recordError)
  }
}

async function deliveryAlreadySent(eventKey: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return false

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("email_deliveries")
      .select("status")
      .eq("event_key", eventKey)
      .maybeSingle()

    return data?.status === "sent"
  } catch {
    return false
  }
}

export async function sendEmail(options: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.warn(`Email ${options.eventKey} non inviata: RESEND_API_KEY non configurata`)
    return { sent: false, skipped: true as const }
  }

  if (await deliveryAlreadySent(options.eventKey)) {
    return { sent: true, duplicate: true as const }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": options.eventKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: configuredSender(),
        to: [options.to],
        reply_to: configuredReplyTo(),
        subject: options.subject,
        html: options.html,
        text: options.text,
        headers: options.headers,
        tags: [
          { name: "category", value: options.category },
          { name: "store", value: "mirai-lab-store" },
        ],
      }),
      cache: "no-store",
    })

    const result = await response.json().catch(() => ({})) as ResendResponse
    if (!response.ok) {
      throw new Error(result.message || `Resend ha risposto con stato ${response.status}`)
    }

    await recordDelivery(options, "sent", result.id)
    return { sent: true, id: result.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore email sconosciuto"
    await recordDelivery(options, "failed", undefined, message)
    throw error
  }
}

export async function sendEmailSafely(options: SendEmailOptions) {
  try {
    return await sendEmail(options)
  } catch (error) {
    console.error(`Invio email ${options.eventKey} non riuscito`, error)
    return { sent: false, error: true as const }
  }
}
