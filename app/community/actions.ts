"use server"

import { revalidatePath } from "next/cache"
import { isAdminEmail } from "@/lib/admin"
import {
  COMMUNITY_MEDIA_BUCKET,
  COMMUNITY_MEDIA_MIME_TYPES,
  COMMUNITY_POST_MAX_LENGTH,
  type CommunityMediaType,
} from "@/lib/community"
import { createAdminClient, getServerUserWithProfile } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }
type ActionResult = { ok: true } | ActionError

async function requireCommunityMember() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || !profile) throw new Error("Accedi alla MIRAI Society per continuare.")

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

function actionError(error: unknown): ActionError {
  return { ok: false, error: error instanceof Error ? error.message : "Operazione non riuscita." }
}

export async function createCommunityPost(formData: FormData): Promise<ActionResult> {
  try {
    const member = await requireCommunityMember()
    const content = String(formData.get("content") || "").trim()
    const mediaPath = String(formData.get("mediaPath") || "").trim()
    const mediaType = String(formData.get("mediaType") || "").trim() as CommunityMediaType
    const mediaMime = String(formData.get("mediaMime") || "").trim().toLowerCase()

    if (!content && !mediaPath) throw new Error("Scrivi un testo o aggiungi un contenuto.")
    if (content.length > COMMUNITY_POST_MAX_LENGTH) {
      throw new Error(`Il post può contenere al massimo ${COMMUNITY_POST_MAX_LENGTH} caratteri.`)
    }

    if (mediaPath) {
      if (!mediaPath.startsWith(`${member.user.id}/`)) throw new Error("Percorso allegato non valido.")
      if (!(["image", "audio", "video"] as string[]).includes(mediaType)) throw new Error("Tipo di allegato non valido.")
      if (!COMMUNITY_MEDIA_MIME_TYPES.has(mediaMime)) throw new Error("Formato allegato non supportato.")
    }

    const admin = createAdminClient()
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await admin
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", member.user.id)
      .gte("created_at", tenMinutesAgo)

    if ((count || 0) >= 5) throw new Error("Hai pubblicato troppi post. Riprova tra qualche minuto.")

    const { error } = await admin.from("community_posts").insert({
      author_id: member.user.id,
      author_name: member.authorName,
      author_role: member.isAdmin ? "admin" : "user",
      content: content || null,
      media_path: mediaPath || null,
      media_type: mediaPath ? mediaType : null,
      media_mime: mediaPath ? mediaMime : null,
    })
    if (error) throw new Error("Non è stato possibile pubblicare il post.")

    revalidatePath("/community/social")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteCommunityPost(postId: string): Promise<ActionResult> {
  try {
    const member = await requireCommunityMember()
    const admin = createAdminClient()
    const { data: post, error: readError } = await admin
      .from("community_posts")
      .select("id, author_id, media_path")
      .eq("id", postId)
      .maybeSingle()

    if (readError || !post) throw new Error("Post non trovato.")
    if (post.author_id !== member.user.id && !member.isAdmin) throw new Error("Non puoi eliminare questo post.")

    const { error } = await admin.from("community_posts").delete().eq("id", postId)
    if (error) throw new Error("Non è stato possibile eliminare il post.")
    if (post.media_path) await admin.storage.from(COMMUNITY_MEDIA_BUCKET).remove([post.media_path])

    revalidatePath("/community/social")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
