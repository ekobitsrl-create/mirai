export const COMMUNITY_MEDIA_BUCKET = "community-media"
export const COMMUNITY_POST_MAX_LENGTH = 1200
export const COMMUNITY_MESSAGE_MAX_LENGTH = 500
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
}

export type CommunityMessage = {
  id: string
  author_id: string
  author_name: string
  author_role: "user" | "admin"
  body: string
  created_at: string
}

export function getCommunityMediaType(mime: string): CommunityMediaType | null {
  if (!COMMUNITY_MEDIA_MIME_TYPES.has(mime)) return null
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("audio/")) return "audio"
  if (mime.startsWith("video/")) return "video"
  return null
}

export function formatCommunityDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
