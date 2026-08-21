"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, AudioLines, Heart, ImageIcon, Loader2, MessageCircle, Pencil, Save, Send, Trash2, Upload, Video, X } from "lucide-react"
import {
  createCommunityPost,
  createCommunityPostComment,
  deleteCommunityPost,
  deleteCommunityPostComment,
  setCommunityPostLike,
  updateCommunityPost,
} from "@/app/community/actions"
import {
  COMMUNITY_COMMENT_MAX_LENGTH,
  COMMUNITY_MEDIA_BUCKET,
  COMMUNITY_MEDIA_MAX_BYTES,
  COMMUNITY_POST_MAX_LENGTH,
  formatCommunityDate,
  getCommunityMediaType,
  type CommunityPost,
} from "@/lib/community"
import { createClient } from "@/lib/supabase/client"
import { CommunityNotifications } from "@/components/community-notifications"

type Props = {
  initialPosts: CommunityPost[]
  currentUserId: string
  isAdmin: boolean
}

function safeFileName(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : ""
  return `${crypto.randomUUID()}${extension.replace(/[^a-z0-9.]/g, "")}`
}

function MediaPreview({ post }: { post: CommunityPost }) {
  if (!post.media_url || !post.media_type) return null

  if (post.media_type === "image") {
    return (
      <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <Image src={post.media_url} alt={`Contenuto di ${post.author_name}`} fill unoptimized sizes="(max-width: 768px) 100vw, 680px" className="object-contain" />
      </div>
    )
  }

  if (post.media_type === "video") {
    return <video className="mt-5 max-h-[70vh] w-full rounded-2xl border border-white/10 bg-black" src={post.media_url} controls playsInline preload="metadata" />
  }

  return <audio className="mt-5 w-full" src={post.media_url} controls preload="metadata" />
}

export function CommunitySocialFeed({ initialPosts, currentUserId, isAdmin }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [posts, setPosts] = useState(initialPosts)
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [engagementBusy, setEngagementBusy] = useState<string[]>([])
  const [openComments, setOpenComments] = useState<string[]>([])
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setPosts(initialPosts), [initialPosts])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("mirai-community-social")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_likes" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_comments" }, () => router.refresh())
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [router])

  const publish = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim() && !file) return

    setIsPublishing(true)
    setError(null)
    const supabase = createClient()
    let uploadedPath: string | null = null

    try {
      const formData = new FormData()
      formData.set("content", content.trim())

      if (file) {
        if (file.size > COMMUNITY_MEDIA_MAX_BYTES) throw new Error("Il file supera il limite di 50 MB.")
        const mediaType = getCommunityMediaType(file.type)
        if (!mediaType) throw new Error("Formato non supportato. Usa immagini, audio o video compatibili.")

        uploadedPath = `${currentUserId}/${safeFileName(file.name)}`
        const { error: uploadError } = await supabase.storage
          .from(COMMUNITY_MEDIA_BUCKET)
          .upload(uploadedPath, file, { cacheControl: "3600", contentType: file.type, upsert: false })
        if (uploadError) throw new Error("Caricamento non riuscito. Controlla formato e dimensione del file.")

        formData.set("mediaPath", uploadedPath)
        formData.set("mediaType", mediaType)
        formData.set("mediaMime", file.type)
      }

      const result = await createCommunityPost(formData)
      if (!result.ok) throw new Error(result.error)

      setContent("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      router.refresh()
    } catch (publishError) {
      if (uploadedPath) await supabase.storage.from(COMMUNITY_MEDIA_BUCKET).remove([uploadedPath])
      setError(publishError instanceof Error ? publishError.message : "Pubblicazione non riuscita.")
    } finally {
      setIsPublishing(false)
    }
  }

  const removePost = async (postId: string) => {
    setDeletingId(postId)
    setError(null)
    const result = await deleteCommunityPost(postId)
    if (!result.ok) setError(result.error)
    else router.refresh()
    setDeletingId(null)
  }

  const clearDraftFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const startEditing = (post: CommunityPost) => {
    setEditingId(post.id)
    setEditingContent(post.content || "")
    setEditingFile(null)
    setRemoveExistingMedia(false)
    setError(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingContent("")
    setEditingFile(null)
    setRemoveExistingMedia(false)
  }

  const savePost = async (post: CommunityPost) => {
    if (!editingContent.trim() && !editingFile && (!post.media_path || removeExistingMedia)) {
      setError("Il post deve contenere un testo o un allegato.")
      return
    }

    setIsSaving(true)
    setError(null)
    const supabase = createClient()
    let uploadedPath: string | null = null

    try {
      const formData = new FormData()
      formData.set("postId", post.id)
      formData.set("content", editingContent.trim())
      formData.set("removeMedia", String(removeExistingMedia))

      if (editingFile) {
        if (editingFile.size > COMMUNITY_MEDIA_MAX_BYTES) throw new Error("Il file supera il limite di 50 MB.")
        const mediaType = getCommunityMediaType(editingFile.type)
        if (!mediaType) throw new Error("Formato non supportato. Usa immagini, audio o video compatibili.")

        uploadedPath = `${currentUserId}/${safeFileName(editingFile.name)}`
        const { error: uploadError } = await supabase.storage
          .from(COMMUNITY_MEDIA_BUCKET)
          .upload(uploadedPath, editingFile, { cacheControl: "3600", contentType: editingFile.type, upsert: false })
        if (uploadError) throw new Error("Caricamento non riuscito. Controlla formato e dimensione del file.")

        formData.set("mediaPath", uploadedPath)
        formData.set("mediaType", mediaType)
        formData.set("mediaMime", editingFile.type)
      }

      const result = await updateCommunityPost(formData)
      if (!result.ok) throw new Error(result.error)

      cancelEditing()
      router.refresh()
    } catch (saveError) {
      if (uploadedPath) await supabase.storage.from(COMMUNITY_MEDIA_BUCKET).remove([uploadedPath])
      setError(saveError instanceof Error ? saveError.message : "Modifica non riuscita.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleLike = async (post: CommunityPost) => {
    if (engagementBusy.includes(`like:${post.id}`)) return

    const shouldLike = !post.liked_by_current_user
    setEngagementBusy((current) => [...current, `like:${post.id}`])
    setError(null)
    setPosts((current) => current.map((item) => item.id === post.id
      ? {
          ...item,
          liked_by_current_user: shouldLike,
          like_count: Math.max(0, item.like_count + (shouldLike ? 1 : -1)),
        }
      : item))

    const result = await setCommunityPostLike(post.id, shouldLike)
    if (!result.ok) {
      setError(result.error)
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, liked_by_current_user: post.liked_by_current_user, like_count: post.like_count }
        : item))
    } else {
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, liked_by_current_user: result.liked, like_count: result.likeCount }
        : item))
    }
    setEngagementBusy((current) => current.filter((key) => key !== `like:${post.id}`))
  }

  const submitComment = async (event: React.FormEvent, postId: string) => {
    event.preventDefault()
    const body = (commentDrafts[postId] || "").trim()
    if (!body || engagementBusy.includes(`comment:${postId}`)) return

    setEngagementBusy((current) => [...current, `comment:${postId}`])
    setError(null)
    const formData = new FormData()
    formData.set("postId", postId)
    formData.set("body", body)
    const result = await createCommunityPostComment(formData)

    if (!result.ok) {
      setError(result.error)
    } else {
      setCommentDrafts((current) => ({ ...current, [postId]: "" }))
      setPosts((current) => current.map((post) => post.id === postId
        ? { ...post, comments: [...post.comments, result.comment] }
        : post))
    }
    setEngagementBusy((current) => current.filter((key) => key !== `comment:${postId}`))
  }

  const removeComment = async (postId: string, commentId: string) => {
    if (engagementBusy.includes(`delete-comment:${commentId}`)) return

    setEngagementBusy((current) => [...current, `delete-comment:${commentId}`])
    setError(null)
    const result = await deleteCommunityPostComment(commentId)
    if (!result.ok) {
      setError(result.error)
    } else {
      setPosts((current) => current.map((post) => post.id === postId
        ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
        : post))
    }
    setEngagementBusy((current) => current.filter((key) => key !== `delete-comment:${commentId}`))
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 text-white sm:px-6 sm:pt-40">
      <Link href="/community/hub" className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Society Hub
      </Link>

      <header className="mt-9 flex items-start justify-between gap-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">Members social</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Inner Circle.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Post, immagini, video e audio condivisi esclusivamente tra i membri della MIRAI Society e gli admin.</p>
        </div>
        <CommunityNotifications />
      </header>

      <form onSubmit={publish} className="mt-10 rounded-[1.5rem] border border-primary/25 bg-[#120d19] p-5 shadow-[0_20px_60px_rgba(0,0,0,.35)] sm:p-6">
        <label htmlFor="community-post" className="text-[8px] font-bold uppercase tracking-[0.22em] text-primary">Crea un post</label>
        <textarea
          id="community-post"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={COMMUNITY_POST_MAX_LENGTH}
          rows={4}
          placeholder="Condividi un outfit, una traccia, un video o un'idea..."
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-primary/60"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/60 hover:border-primary/45 hover:text-white">
              <Upload className="h-3.5 w-3.5" /> Allega media
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,audio/mp4,video/mp4,video/webm,video/quicktime"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>
            {file && (
              <span className="inline-flex max-w-[260px] items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55">
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={clearDraftFile} aria-label="Rimuovi allegato" className="shrink-0 rounded-full p-0.5 hover:bg-white/10 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
          <button type="submit" disabled={isPublishing || (!content.trim() && !file)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-40">
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Pubblica
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-[8px] uppercase tracking-[0.16em] text-white/30">
          <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Immagini</span>
          <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> Video</span>
          <span className="inline-flex items-center gap-1.5"><AudioLines className="h-3.5 w-3.5" /> Audio</span>
          <span>Max 50 MB</span>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </form>

      <section className="mt-8 space-y-4" aria-label="Post della community">
        {posts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/40">Il feed è pronto. Pubblica il primo contenuto della Society.</div>
        )}
        {posts.map((post) => (
          <article id={`post-${post.id}`} key={post.id} className="scroll-mt-32 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-black text-primary">{post.author_name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold">{post.author_name}</p>
                    {post.author_role === "admin" && <span className="rounded-full bg-primary/15 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-primary">Admin</span>}
                  </div>
                  <p className="mt-0.5 text-[10px] text-white/30">{formatCommunityDate(post.created_at)}</p>
                </div>
              </div>
              {(isAdmin || post.author_id === currentUserId) && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => startEditing(post)} disabled={editingId === post.id || deletingId === post.id} aria-label="Modifica post" className="rounded-full border border-white/10 p-2.5 text-white/35 hover:border-primary/50 hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => void removePost(post.id)} disabled={deletingId === post.id || editingId === post.id} aria-label="Elimina post" className="rounded-full border border-white/10 p-2.5 text-white/35 hover:border-red-400/40 hover:text-red-300">
                    {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
            {editingId === post.id ? (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-black/20 p-4">
                <label htmlFor={`edit-post-${post.id}`} className="text-[8px] font-bold uppercase tracking-[0.18em] text-primary">Modifica post</label>
                <textarea
                  id={`edit-post-${post.id}`}
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  maxLength={COMMUNITY_POST_MAX_LENGTH}
                  rows={4}
                  className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none focus:border-primary/60"
                />

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/60 hover:border-primary/45 hover:text-white">
                    <Upload className="h-3.5 w-3.5" /> {post.media_path ? "Sostituisci allegato" : "Allega media"}
                    <input
                      key={`${post.id}-${editingId}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,audio/mp4,video/mp4,video/webm,video/quicktime"
                      className="sr-only"
                      onChange={(event) => {
                        setEditingFile(event.target.files?.[0] || null)
                        if (event.target.files?.[0]) setRemoveExistingMedia(true)
                      }}
                    />
                  </label>

                  {post.media_path && !removeExistingMedia && !editingFile && (
                    <button type="button" onClick={() => setRemoveExistingMedia(true)} className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-red-200 hover:border-red-400/60">
                      <Trash2 className="h-3.5 w-3.5" /> Rimuovi allegato
                    </button>
                  )}

                  {editingFile && (
                    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55">
                      <span className="max-w-[220px] truncate">{editingFile.name}</span>
                      <button type="button" onClick={() => {
                        setEditingFile(null)
                        setRemoveExistingMedia(false)
                      }} aria-label="Annulla sostituzione allegato" className="shrink-0 rounded-full p-0.5 hover:bg-white/10 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}

                  {post.media_path && removeExistingMedia && !editingFile && (
                    <button type="button" onClick={() => setRemoveExistingMedia(false)} className="text-xs text-white/45 underline underline-offset-4 hover:text-white">Mantieni l’allegato</button>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
                  <button type="button" onClick={cancelEditing} disabled={isSaving} className="rounded-full border border-white/10 px-5 py-3 text-[8px] font-bold uppercase tracking-[0.16em] text-white/60 hover:text-white">Annulla</button>
                  <button type="button" onClick={() => void savePost(post)} disabled={isSaving || (!editingContent.trim() && !editingFile && (!post.media_path || removeExistingMedia))} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[8px] font-black uppercase tracking-[0.16em] text-white disabled:opacity-40">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salva modifiche
                  </button>
                </div>
              </div>
            ) : (
              <>
                {post.content && <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-white/75">{post.content}</p>}
                <MediaPreview post={post} />
                <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => void toggleLike(post)}
                    disabled={engagementBusy.includes(`like:${post.id}`)}
                    aria-pressed={post.liked_by_current_user}
                    aria-label={post.liked_by_current_user ? "Rimuovi like" : "Metti like"}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${post.liked_by_current_user ? "border-primary/55 bg-primary/15 text-primary" : "border-white/10 text-white/55 hover:border-primary/40 hover:text-white"}`}
                  >
                    <Heart className={`h-4 w-4 ${post.liked_by_current_user ? "fill-current" : ""}`} />
                    <span>{post.like_count}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenComments((current) => current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id])}
                    aria-expanded={openComments.includes(post.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/55 transition-colors hover:border-primary/40 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                    <span className="sr-only">commenti</span>
                  </button>
                </div>

                {openComments.includes(post.id) && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="space-y-3" aria-live="polite">
                      {post.comments.length === 0 && (
                        <p className="text-xs text-white/35">Nessun commento. Inizia tu la conversazione.</p>
                      )}
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.035] p-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-xs font-bold text-white/80">{comment.author_name}</p>
                              {comment.author_role === "admin" && <span className="rounded-full bg-primary/15 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-primary">Admin</span>}
                              <span className="text-[9px] text-white/25">{formatCommunityDate(comment.created_at)}</span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-white/65">{comment.body}</p>
                          </div>
                          {(isAdmin || comment.author_id === currentUserId) && (
                            <button
                              type="button"
                              onClick={() => void removeComment(post.id, comment.id)}
                              disabled={engagementBusy.includes(`delete-comment:${comment.id}`)}
                              aria-label="Elimina commento"
                              className="shrink-0 rounded-full p-2 text-white/25 hover:bg-red-400/10 hover:text-red-300"
                            >
                              {engagementBusy.includes(`delete-comment:${comment.id}`) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={(event) => void submitComment(event, post.id)} className="mt-4 flex items-end gap-2 border-t border-white/10 pt-4">
                      <label htmlFor={`comment-${post.id}`} className="sr-only">Scrivi un commento</label>
                      <textarea
                        id={`comment-${post.id}`}
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        maxLength={COMMUNITY_COMMENT_MAX_LENGTH}
                        rows={2}
                        placeholder="Scrivi un commento..."
                        className="min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-white/25 focus:border-primary/60"
                      />
                      <button
                        type="submit"
                        disabled={!commentDrafts[post.id]?.trim() || engagementBusy.includes(`comment:${post.id}`)}
                        aria-label="Pubblica commento"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {engagementBusy.includes(`comment:${post.id}`) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}
