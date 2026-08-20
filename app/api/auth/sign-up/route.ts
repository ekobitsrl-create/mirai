import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { accountConfirmationTemplate } from "@/lib/email/templates"
import { sendEmail } from "@/lib/email/resend"
import {
  consumeRateLimit,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"
import { SITE_URL } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 16 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SignUpPayload = {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  password?: unknown
  marketingConsent?: unknown
  next?: unknown
}

function textField(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : ""
}

function safeNextPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value.slice(0, 500)
    : "/community/hub"
}

function publicError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return publicError("Richiesta non valida.", 403)
  }

  if (!await consumeRateLimit({
    bucket: "public-sign-up",
    limit: 5,
    windowSeconds: 60 * 60,
    request,
  })) {
    return publicError("Troppi tentativi. Attendi qualche minuto e riprova.", 429)
  }

  let payload: SignUpPayload
  try {
    payload = await readJsonBody<SignUpPayload>(request, MAX_BODY_BYTES)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return publicError("Richiesta troppo grande.", 413)
    }
    return publicError("Dati di registrazione non validi.", 400)
  }

  const firstName = textField(payload.firstName, 80)
  const lastName = textField(payload.lastName, 80)
  const email = textField(payload.email, 254).toLowerCase()
  const password = typeof payload.password === "string" ? payload.password : ""
  const marketingConsent = payload.marketingConsent === true
  const nextPath = safeNextPath(payload.next)

  if (!firstName || !lastName) {
    return publicError("Inserisci nome e cognome.", 400)
  }
  if (!EMAIL_PATTERN.test(email)) {
    return publicError("Inserisci un indirizzo email valido.", 400)
  }
  if (password.length < 6 || password.length > 128) {
    return publicError("La password deve contenere da 6 a 128 caratteri.", 400)
  }

  const confirmationUrl = new URL("/auth/confirm", SITE_URL)
  confirmationUrl.searchParams.set("next", nextPath)
  const admin = createAdminClient()
  let createdUserId: string | null = null
  let shouldRollbackUser = false

  try {
    const consentTimestamp = marketingConsent ? new Date().toISOString() : null
    const userMetadata = {
      first_name: firstName,
      last_name: lastName,
      membership: "mirai-society",
      marketing_consent: marketingConsent,
      marketing_consent_at: consentTimestamp,
    }
    const { data: existingProfile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (profileError) throw profileError

    let linkResult
    if (existingProfile?.id) {
      const { data: existingAuth, error: existingAuthError } = await admin.auth.admin.getUserById(existingProfile.id)
      if (existingAuthError) throw existingAuthError
      if (existingAuth.user.email_confirmed_at) {
        return publicError(
          "Esiste già un account con questa email. Accedi oppure recupera la password.",
          409,
        )
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(existingProfile.id, {
        password,
        user_metadata: userMetadata,
      })
      if (updateError) throw updateError

      createdUserId = existingProfile.id
      linkResult = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: confirmationUrl.toString() },
      })
    } else {
      linkResult = await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: confirmationUrl.toString(),
          data: userMetadata,
        },
      })
      createdUserId = linkResult.data.user?.id || null
      shouldRollbackUser = Boolean(createdUserId)
    }

    const { data, error } = linkResult

    if (error) {
      console.warn("[sign-up] Creazione account non riuscita", {
        code: error.code,
        status: error.status,
      })
      return publicError(
        "Non è stato possibile creare l'account. Se questa email è già registrata, accedi oppure recupera la password.",
        409,
      )
    }

    createdUserId ||= data.user?.id || null
    const actionLink = data.properties?.action_link
    if (!createdUserId || !actionLink) {
      throw new Error("Supabase non ha restituito il link di conferma")
    }

    const delivery = await sendEmail({
      to: email,
      eventKey: `auth-confirmation:${createdUserId}:${randomUUID()}`,
      category: "transactional",
      ...accountConfirmationTemplate({ firstName, confirmationUrl: actionLink }),
    })

    if (!delivery.sent) {
      throw new Error("Provider email non configurato")
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (createdUserId && shouldRollbackUser) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(createdUserId)
      if (cleanupError) {
        console.error("[sign-up] Rollback account non riuscito", {
          code: cleanupError.code,
          status: cleanupError.status,
        })
      }
    }

    console.error("[sign-up] Invio conferma non riuscito", {
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    })
    return publicError("Registrazione temporaneamente non disponibile. Riprova tra poco.", 503)
  }
}
