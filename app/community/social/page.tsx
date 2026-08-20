import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CommunitySocialFeed } from "@/components/community-social-feed"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { isAdminEmail } from "@/lib/admin"
import { COMMUNITY_MEDIA_BUCKET, type CommunityPost, type CommunityPostComment } from "@/lib/community"
import { createAdminClient, getServerUserWithProfile } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Inner Circle | MIRAI Society",
  description: "Il social privato dei membri MIRAI Society.",
  robots: { index: false, follow: false },
}

export default async function CommunitySocialPage() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || !profile) redirect("/auth/login?redirectTo=/community/social")

  const typedProfile = profile as { role?: string | null }
  const isAdmin = typedProfile.role === "admin" || isAdminEmail(user.email)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("community_posts")
    .select("id, author_id, author_name, author_role, content, media_path, media_type, media_mime, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw new Error("Impossibile caricare il feed della community.")

  const basePosts = (data || []) as Omit<CommunityPost, "like_count" | "liked_by_current_user" | "comments">[]
  const postIds = basePosts.map((post) => post.id)
  const [{ data: likes, error: likesError }, { data: comments, error: commentsError }] = postIds.length > 0
    ? await Promise.all([
        admin.from("community_post_likes").select("post_id, user_id").in("post_id", postIds),
        admin
          .from("community_post_comments")
          .select("id, post_id, author_id, author_name, author_role, body, created_at, updated_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: true }),
      ])
    : [{ data: [], error: null }, { data: [], error: null }]

  if (likesError || commentsError) throw new Error("Impossibile caricare like e commenti della community.")

  const likeCountByPost = new Map<string, number>()
  const likedPosts = new Set<string>()
  for (const like of likes || []) {
    likeCountByPost.set(like.post_id, (likeCountByPost.get(like.post_id) || 0) + 1)
    if (like.user_id === user.id) likedPosts.add(like.post_id)
  }

  const commentsByPost = new Map<string, CommunityPostComment[]>()
  for (const comment of (comments || []) as CommunityPostComment[]) {
    const postComments = commentsByPost.get(comment.post_id) || []
    postComments.push(comment)
    commentsByPost.set(comment.post_id, postComments)
  }

  const posts = await Promise.all(basePosts.map(async (post): Promise<CommunityPost> => {
    const engagement = {
      like_count: likeCountByPost.get(post.id) || 0,
      liked_by_current_user: likedPosts.has(post.id),
      comments: commentsByPost.get(post.id) || [],
    }
    if (!post.media_path) return { ...post, ...engagement, media_url: null }
    const { data: signed } = await admin.storage.from(COMMUNITY_MEDIA_BUCKET).createSignedUrl(post.media_path, 60 * 60)
    return { ...post, ...engagement, media_url: signed?.signedUrl || null }
  }))

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b]">
      <Navbar />
      <CommunitySocialFeed initialPosts={posts} currentUserId={user.id} isAdmin={isAdmin} />
      <Footer />
    </main>
  )
}
