import { NextResponse } from "next/server"
import { getCommunityMemberIdentity } from "@/lib/community-auth"
import type { CommunityNotification } from "@/lib/community"
import { isSameOriginRequest, readJsonBody, RequestBodyTooLargeError } from "@/lib/request-security"
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 8 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ApiError = { ok: false; error: string }
type NotificationListResponse = {
  ok: true
  notifications: CommunityNotification[]
  unreadCount: number
}

function jsonError(error: string, status: number) {
  return NextResponse.json<ApiError>({ ok: false, error }, { status })
}

export async function GET() {
  try {
    const member = await getCommunityMemberIdentity()
    if (!member) return jsonError("Accedi alla MIRAI Society per continuare.", 401)

    const admin = createAdminClient()
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      admin
        .from("community_notifications")
        .select("id, actor_id, actor_name, notification_type, post_id, excerpt, read_at, created_at")
        .eq("recipient_id", member.user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      admin
        .from("community_notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", member.user.id)
        .is("read_at", null),
    ])

    if (error || countError) {
      console.error("[community-notifications] Read failed", { code: error?.code || countError?.code })
      return jsonError("Non è stato possibile caricare le notifiche.", 500)
    }

    return NextResponse.json<NotificationListResponse>(
      {
        ok: true,
        notifications: (data || []) as CommunityNotification[],
        unreadCount: count || 0,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    )
  } catch (error) {
    console.error("[community-notifications] Unexpected read error", error)
    return jsonError("Non è stato possibile caricare le notifiche.", 500)
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("Richiesta non valida.", 403)

  try {
    const member = await getCommunityMemberIdentity()
    if (!member) return jsonError("Accedi alla MIRAI Society per continuare.", 401)

    const payload = await readJsonBody<{ notificationId?: unknown; markAll?: unknown }>(request, MAX_BODY_BYTES)
    const notificationId = typeof payload.notificationId === "string" ? payload.notificationId.trim() : ""
    const markAll = payload.markAll === true
    if (!markAll && !UUID_PATTERN.test(notificationId)) return jsonError("Notifica non valida.", 400)

    const admin = createAdminClient()
    let query = admin
      .from("community_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", member.user.id)
      .is("read_at", null)

    if (!markAll) query = query.eq("id", notificationId)
    const { error } = await query
    if (error) {
      console.error("[community-notifications] Update failed", { code: error.code })
      return jsonError("Non è stato possibile aggiornare le notifiche.", 500)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonError("Richiesta troppo grande.", 413)
    if (error instanceof SyntaxError) return jsonError("Richiesta non valida.", 400)
    console.error("[community-notifications] Unexpected update error", error)
    return jsonError("Non è stato possibile aggiornare le notifiche.", 500)
  }
}
