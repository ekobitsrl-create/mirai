import "server-only"

import { isAdminEmail } from "@/lib/admin"
import { getServerUserWithProfile } from "@/lib/supabase/server"

export async function getCommunityMemberIdentity() {
  const { user, profile } = await getServerUserWithProfile()
  if (!user || !profile) return null

  const typedProfile = profile as {
    first_name?: string | null
    last_name?: string | null
    role?: string | null
  }
  const isAdmin = typedProfile.role === "admin" || isAdminEmail(user.email)
  const hasSocietyMembership = user.user_metadata?.membership === "mirai-society"
  if (!isAdmin && !hasSocietyMembership) return null

  const fullName = [typedProfile.first_name, typedProfile.last_name].filter(Boolean).join(" ").trim()

  return {
    user,
    profile,
    authorName: fullName || user.email?.split("@")[0] || "MIRAI Member",
    isAdmin,
  }
}

export async function requireCommunityMemberIdentity() {
  const member = await getCommunityMemberIdentity()
  if (!member) throw new Error("Accedi alla MIRAI Society per continuare.")
  return member
}
