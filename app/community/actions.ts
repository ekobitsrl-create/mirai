"use server"

import { revalidatePath } from "next/cache"
import { isAdminEmail } from "@/lib/admin"
import {
  COMMUNITY_MEDIA_BUCKET,
  COMMUNITY_MEDIA_MIME_TYPES,
  COMMUNITY_COMMENT_MAX_LENGTH,
  COMMUNITY_POST_MAX_LENGTH,
  type CommunityPostComment,
  type CommunityMediaType,
} from "@/lib/community"
import { createAdminClient, getServerUserWithProfile } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }
type ActionResult = { ok: true } | ActionError
type LikeActionResult = { ok: true; liked: boolean; likeCount: number } | ActionError
type CommentActionResult = { ok: true; comment: CommunityPostComment } | ActionError
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

export async function updateCommunityPost(formData: FormData): Promise<ActionResult> {
  let uploadedMediaPath = ""

  try {
    const member = await requireCommunityMember()
    const postId = String(formData.get("postId") || "").trim()
    const content = String(formData.get("content") || "").trim()
    const removeMedia = String(formData.get("removeMedia") || "") === "true"
    uploadedMediaPath = String(formData.get("mediaPath") || "").trim()
    const uploadedMediaType = String(formData.get("mediaType") || "").trim() as CommunityMediaType
    const uploadedMediaMime = String(formData.get("mediaMime") || "").trim().toLowerCase()

    if (!UUID_PATTERN.test(postId)) throw new Error("Post non valido.")
    if (content.length > COMMUNITY_POST_MAX_LENGTH) {
      throw new Error(`Il post può contenere al massimo ${COMMUNITY_POST_MAX_LENGTH} caratteri.`)
    }
    if (uploadedMediaPath) {
      if (!uploadedMediaPath.startsWith(`${member.user.id}/`)) throw new Error("Percorso allegato non valido.")
      if (!("image audio video".split(" ") as string[]).includes(uploadedMediaType)) {
        throw new Error("Tipo di allegato non valido.")
      }
      if (!COMMUNITY_MEDIA_MIME_TYPES.has(uploadedMediaMime)) throw new Error("Formato allegato non supportato.")
    }

    const admin = createAdminClient()
    const { data: post, error: readError } = await admin
      .from("community_posts")
      .select("id, author_id, media_path, media_type, media_mime")
      .eq("id", postId)
      .maybeSingle()

    if (readError || !post) throw new Error("Post non trovato.")
    if (post.author_id !== member.user.id && !member.isAdmin) throw new Error("Non puoi modificare questo post.")

    const nextMediaPath = uploadedMediaPath || (removeMedia ? null : post.media_path)
    const nextMediaType = uploadedMediaPath ? uploadedMediaType : (removeMedia ? null : post.media_type)
    const nextMediaMime = uploadedMediaPath ? uploadedMediaMime : (removeMedia ? null : post.media_mime)
    if (!content && !nextMediaPath) throw new Error("Il post deve contenere un testo o un allegato.")

    const { error } = await admin
      .from("community_posts")
      .update({
        content: content || null,
        media_path: nextMediaPath,
        media_type: nextMediaType,
        media_mime: nextMediaMime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (error) throw new Error("Non è stato possibile modificare il post.")

    if (post.media_path && post.media_path !== nextMediaPath) {
      const { error: storageError } = await admin.storage.from(COMMUNITY_MEDIA_BUCKET).remove([post.media_path])
      if (storageError) console.error("[community-social] Old post media cleanup failed", { code: storageError.name })
    }

    revalidatePath("/community/social")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function setCommunityPostLike(postId: string, shouldLike: boolean): Promise<LikeActionResult> {
  try {
    const member = await requireCommunityMember()
    if (!UUID_PATTERN.test(postId)) throw new Error("Post non valido.")

    const admin = createAdminClient()
    const { data: post, error: postError } = await admin
      .from("community_posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle()
    if (postError || !post) throw new Error("Post non trovato.")

    if (shouldLike) {
      const { error } = await admin.from("community_post_likes").upsert(
        { post_id: postId, user_id: member.user.id },
        { onConflict: "post_id,user_id", ignoreDuplicates: true },
      )
      if (error) throw new Error("Non è stato possibile aggiungere il like.")
    } else {
      const { error } = await admin
        .from("community_post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", member.user.id)
      if (error) throw new Error("Non è stato possibile rimuovere il like.")
    }

    const { count, error: countError } = await admin
      .from("community_post_likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId)
    if (countError) throw new Error("Non è stato possibile aggiornare i like.")

    revalidatePath("/community/social")
    return { ok: true, liked: shouldLike, likeCount: count || 0 }
  } catch (error) {
    return actionError(error)
  }
}

export async function createCommunityPostComment(formData: FormData): Promise<CommentActionResult> {
  try {
    const member = await requireCommunityMember()
    const postId = String(formData.get("postId") || "").trim()
    const body = String(formData.get("body") || "").trim()

    if (!UUID_PATTERN.test(postId)) throw new Error("Post non valido.")
    if (!body) throw new Error("Scrivi un commento.")
    if (body.length > COMMUNITY_COMMENT_MAX_LENGTH) {
      throw new Error(`Il commento può contenere al massimo ${COMMUNITY_COMMENT_MAX_LENGTH} caratteri.`)
    }

    const admin = createAdminClient()
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await admin
      .from("community_post_comments")
      .select("id", { count: "exact", head: true })
      .eq("author_id", member.user.id)
      .gte("created_at", tenMinutesAgo)
    if ((count || 0) >= 20) throw new Error("Hai inviato troppi commenti. Riprova tra qualche minuto.")

    const { data, error } = await admin
      .from("community_post_comments")
      .insert({
        post_id: postId,
        author_id: member.user.id,
        author_name: member.authorName,
        author_role: member.isAdmin ? "admin" : "user",
        body,
      })
      .select("id, post_id, author_id, author_name, author_role, body, created_at, updated_at")
      .single()
    if (error || !data) throw new Error("Non è stato possibile pubblicare il commento.")

    revalidatePath("/community/social")
    return { ok: true, comment: data as CommunityPostComment }
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteCommunityPostComment(commentId: string): Promise<ActionResult> {
  try {
    const member = await requireCommunityMember()
    if (!UUID_PATTERN.test(commentId)) throw new Error("Commento non valido.")

    const admin = createAdminClient()
    const { data: comment, error: readError } = await admin
      .from("community_post_comments")
      .select("id, author_id")
      .eq("id", commentId)
      .maybeSingle()
    if (readError || !comment) throw new Error("Commento non trovato.")
    if (comment.author_id !== member.user.id && !member.isAdmin) {
      throw new Error("Non puoi eliminare questo commento.")
    }

    const { error } = await admin.from("community_post_comments").delete().eq("id", commentId)
    if (error) throw new Error("Non è stato possibile eliminare il commento.")

    revalidatePath("/community/social")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
