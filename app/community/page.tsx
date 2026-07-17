import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CommunityHub } from "@/components/mirai-community"
import { getServerUserWithProfile } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "MIRAI Community",
  description: "Il Community Hub riservato ai membri MIRAI: anteprime, podcast, social room ed eventi.",
  robots: { index: false, follow: false },
}

export default async function CommunityPage() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user) redirect("/auth/login?redirectTo=/community")

  const memberProfile = profile as { first_name?: string | null; last_name?: string | null } | null
  const fullName = [memberProfile?.first_name, memberProfile?.last_name].filter(Boolean).join(" ")
  const member = {
    id: user.id,
    name: fullName || user.email?.split("@")[0] || "MIRAI Member",
    email: user.email || "",
    createdAt: user.created_at,
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070b]">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(159,134,255,0.13),transparent_28%),radial-gradient(circle_at_88%_70%,rgba(213,77,255,0.07),transparent_34%)]" />
      <div className="relative">
        <CommunityHub member={member} />
      </div>
      <Footer />
    </main>
  )
}
