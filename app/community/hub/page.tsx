import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CommunityHub } from "@/components/mirai-community"
import { isAdminEmail } from "@/lib/admin"
import { getServerUserWithProfile } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "MIRΛI Society Hub",
  description: "Il Society Hub riservato ai membri MIRΛI.",
  robots: { index: false, follow: false },
}

export default async function CommunityHubPage() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user) redirect("/auth/login?redirectTo=/community/hub")

  const memberProfile = profile as { first_name?: string | null; last_name?: string | null; role?: string | null } | null
  const isAdmin = memberProfile?.role === "admin" || isAdminEmail(user.email)
  const fullName = [memberProfile?.first_name, memberProfile?.last_name].filter(Boolean).join(" ")
  const member = {
    id: user.id,
    name: fullName || user.email?.split("@")[0] || "MIRΛI Member",
    email: user.email || "",
    createdAt: user.created_at,
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b]">
      <Navbar />
      <CommunityHub member={member} isAdmin={isAdmin} />
      <Footer />
    </main>
  )
}
