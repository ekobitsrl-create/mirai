import { NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/admin"
import { COMMUNITY_MESSAGE_MAX_LENGTH, type CommunityMessage } from "@/lib/community"
import { isSameOriginRequest, readJsonBody, RequestBodyTooLargeError } from "@/lib/request-security"
import { createAdminClient, getServerUserWithProfile } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 8 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ApiError = { ok: false; error: string }
type MessageResponse = { ok: true; message: CommunityMessage } | ApiError
type DeleteResponse = { ok: true } | ApiError

function jsonError(error: string, status: number) {
  return NextResponse.json<ApiError>({ ok: false, error }, { status })
}

async function requireCommunityMember() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || !profile) return null

  const typedProfile = profile as {
    first_name?: string | null
    last_name?: string | null
    role?: string | null
  }
  const fullName = [typedProfile.first_name, typedProfile.last_name].filter(Boolean).join(" ").trim()

  return {
    user,
    authorName: fullName || user.email?.split("@")[0] || "MIRAI Member",
    isAdmin: typedProfile.role === "admin" || isAdminEmail(user.email),
  }
}

function invalidRequest(request: Request) {
  return !isSameOriginRequest(request)
}

export async function POST(request: Request) {
  if (invalidRequest(request)) return jsonError("Richiesta non valida.", 403)

  try {
    const member = await requireCommunityMember()
    if (!member) return jsonError("Accedi alla MIRAI Society per continuare.", 401)

    const payload = await readJsonBody<{ body?: unknown }>(request, MAX_BODY_BYTES)
    const message = typeof payload.body === "string" ? payload.body.trim() : ""
    if (!message) return jsonError("Scrivi un messaggio.", 400)
    if (message.length > COMMUNITY_MESSAGE_MAX_LENGTH) {
      return jsonError(`Il messaggio può contenere al massimo ${COMMUNITY_MESSAGE_MAX_LENGTH} caratteri.`, 400)
    }

    const admin = createAdminClient()
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count, error: countError } = await admin
      .from("community_messages")
      .select("id", { count: "exact", head: true })
      .eq("author_id", member.user.id)
      .gte("created_at", oneMinuteAgo)

    if (countError) {
      console.error("[community-chat] Rate check failed", { code: countError.code })
      return jsonError("Non è stato possibile inviare il messaggio.", 500)
    }
    if ((count || 0) >= 20) {
      return jsonError("Stai inviando troppi messaggi. Attendi qualche secondo.", 429)
    }

    const { data, error } = await admin
      .from("community_messages")
      .insert({
        author_id: member.user.id,
        author_name: member.authorName,
        author_role: member.isAdmin ? "admin" : "user",
        body: message,
      })
      .select("id, author_id, author_name, author_role, body, created_at")
      .single()

    if (error || !data) {
      console.error("[community-chat] Message insert failed", { code: error?.code })
      return jsonError("Non è stato possibile inviare il messaggio.", 500)
    }

    return NextResponse.json<MessageResponse>({ ok: true, message: data as CommunityMessage })
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonError("Messaggio troppo grande.", 413)
    if (error instanceof SyntaxError) return jsonError("Richiesta non valida.", 400)
    console.error("[community-chat] Unexpected message error", error)
    return jsonError("Non è stato possibile inviare il messaggio.", 500)
  }
}

export async function DELETE(request: Request) {
  if (invalidRequest(request)) return jsonError("Richiesta non valida.", 403)

  try {
    const member = await requireCommunityMember()
    if (!member) return jsonError("Accedi alla MIRAI Society per continuare.", 401)

    const payload = await readJsonBody<{ messageId?: unknown }>(request, MAX_BODY_BYTES)
    const messageId = typeof payload.messageId === "string" ? payload.messageId.trim() : ""
    if (!UUID_PATTERN.test(messageId)) return jsonError("Messaggio non valido.", 400)

    const admin = createAdminClient()
    const { data: message, error: readError } = await admin
      .from("community_messages")
      .select("id, author_id")
      .eq("id", messageId)
      .maybeSingle()

    if (readError) {
      console.error("[community-chat] Message lookup failed", { code: readError.code })
      return jsonError("Non è stato possibile eliminare il messaggio.", 500)
    }
    if (!message) return jsonError("Messaggio non trovato.", 404)
    if (message.author_id !== member.user.id && !member.isAdmin) {
      return jsonError("Non puoi eliminare questo messaggio.", 403)
    }

    const { error } = await admin.from("community_messages").delete().eq("id", messageId)
    if (error) {
      console.error("[community-chat] Message delete failed", { code: error.code })
      return jsonError("Non è stato possibile eliminare il messaggio.", 500)
    }

    return NextResponse.json<DeleteResponse>({ ok: true })
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonError("Richiesta troppo grande.", 413)
    if (error instanceof SyntaxError) return jsonError("Richiesta non valida.", 400)
    console.error("[community-chat] Unexpected delete error", error)
    return jsonError("Non è stato possibile eliminare il messaggio.", 500)
  }
}
