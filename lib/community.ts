export const COMMUNITY_MEDIA_BUCKET = "community-media"
export const COMMUNITY_POST_MAX_LENGTH = 1200
export const COMMUNITY_MESSAGE_MAX_LENGTH = 500
export const COMMUNITY_COMMENT_MAX_LENGTH = 500
export const COMMUNITY_MEDIA_MAX_BYTES = 50 * 1024 * 1024

export type CommunityMediaType = "image" | "audio" | "video"

export const COMMUNITY_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "video/mp4",
  "video/webm",
  "video/quicktime",
])

export type CommunityPost = {
  id: string
  author_id: string
  author_name: string
  author_role: "user" | "admin"
  content: string | null
  media_path: string | null
  media_type: CommunityMediaType | null
  media_mime: string | null
  media_url?: string | null
  created_at: string
  updated_at: string
  like_count: number
  liked_by_current_user: boolean
  comments: CommunityPostComment[]
}

export type CommunityPostComment = {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_role: "user" | "admin"
  body: string
  created_at: string
  updated_at: string
}

export type CommunityNotificationType = "post_like" | "post_comment"

export type CommunityNotification = {
  id: string
  actor_id: string
  actor_name: string
  notification_type: CommunityNotificationType
  post_id: string
  excerpt: string | null
  read_at: string | null
  created_at: string
}

export type CommunityMessage = {
  id: string
  author_id: string
  author_name: string
  author_role: "user" | "admin"
  body: string
  created_at: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * Realtime payloads and API responses cross a network boundary, so their
 * compile-time cast cannot guarantee that every field is actually present.
 * Invalid rows are ignored instead of being allowed to crash the whole chat.
 */
export function normalizeCommunityMessage(value: unknown): CommunityMessage | null {
  if (!isRecord(value)) return null

  const id = typeof value.id === "string" ? value.id.trim() : ""
  const authorId = typeof value.author_id === "string" ? value.author_id.trim() : ""
  const authorName = typeof value.author_name === "string" ? value.author_name.trim() : ""
  const body = typeof value.body === "string" ? value.body : ""
  const createdAt = typeof value.created_at === "string" ? value.created_at : ""
  const timestamp = Date.parse(createdAt)

  if (!id || !authorId || !authorName || !body.trim() || !Number.isFinite(timestamp)) return null

  return {
    id,
    author_id: authorId,
    author_name: authorName,
    author_role: value.author_role === "admin" ? "admin" : "user",
    body,
    created_at: new Date(timestamp).toISOString(),
  }
}

export function getCommunityMediaType(mime: string): CommunityMediaType | null {
  if (!COMMUNITY_MEDIA_MIME_TYPES.has(mime)) return null
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("audio/")) return "audio"
  if (mime.startsWith("video/")) return "video"
  return null
}

export function formatCommunityDate(value: unknown) {
  const timestamp = typeof value === "string" ? Date.parse(value) : Number.NaN
  if (!Number.isFinite(timestamp)) return "Ora"

  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp))
  } catch {
    return "Ora"
  }
}
