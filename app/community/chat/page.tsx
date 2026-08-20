import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CommunityChat } from "@/components/community-chat"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { isAdminEmail } from "@/lib/admin"
import { normalizeCommunityMessage } from "@/lib/community"
import { createAdminClient, getServerUserWithProfile } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Society Chat | MIRAI",
  description: "La chat privata dei membri MIRAI Society.",
  robots: { index: false, follow: false },
}

export default async function CommunityChatPage() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || !profile) redirect("/auth/login?redirectTo=/community/chat")

  const typedProfile = profile as { role?: string | null }
  const isAdmin = typedProfile.role === "admin" || isAdminEmail(user.email)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("community_messages")
    .select("id, author_id, author_name, author_role, body, created_at")
    .order("created_at", { ascending: false })
    .limit(150)

  if (error) throw new Error("Impossibile caricare la chat della community.")
  const messages = (data || [])
    .flatMap((message) => {
      const normalized = normalizeCommunityMessage(message)
      return normalized ? [normalized] : []
    })
    .reverse()

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b]">
      <Navbar />
      <CommunityChat initialMessages={messages} currentUserId={user.id} isAdmin={isAdmin} />
      <Footer />
    </main>
  )
}
