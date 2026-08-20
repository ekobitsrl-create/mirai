import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CommunitySocialFeed } from "@/components/community-social-feed"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { isAdminEmail } from "@/lib/admin"
import { COMMUNITY_MEDIA_BUCKET, type CommunityPost } from "@/lib/community"
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

  const posts = await Promise.all(((data || []) as CommunityPost[]).map(async (post) => {
    if (!post.media_path) return { ...post, media_url: null }
    const { data: signed } = await admin.storage.from(COMMUNITY_MEDIA_BUCKET).createSignedUrl(post.media_path, 60 * 60)
    return { ...post, media_url: signed?.signedUrl || null }
  }))

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b]">
      <Navbar />
      <CommunitySocialFeed initialPosts={posts} currentUserId={user.id} isAdmin={isAdmin} />
      <Footer />
    </main>
  )
}
