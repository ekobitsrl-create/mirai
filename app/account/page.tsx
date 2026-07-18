"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Package, ArrowRight, LogOut } from "lucide-react"
import { isAdminEmail } from "@/lib/admin"
import { AdminPanel } from "@/components/admin-panel"
import { CommunityPreview } from "@/components/mirai-community"

export default function AccountPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Listen for auth state changes - this properly waits for session hydration
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event, "user:", session?.user?.email)
      
      if (event === "SIGNED_OUT" || (!session && event === "INITIAL_SESSION")) {
        router.push("/auth/login")
        return
      }

      if (!session?.user) return

      const currentUser = session.user
      setUser(currentUser)

      // Check if admin by email (instant, no DB needed)
      if (isAdminEmail(currentUser.email)) {
        console.log("[v0] IS ADMIN - showing admin panel")
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // For other users, get profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()
      
      const typedProfile = prof as { role?: string; first_name?: string; last_name?: string } | null
      setProfile(typedProfile)
      if (typedProfile?.role === "admin") {
        setIsAdmin(true)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/clear-session', { method: 'POST' }).catch(() => {})
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  // If admin, show the admin panel directly
  if (isAdmin) {
    return <AdminPanel />
  }

  // Normal user account page
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
  const communityMember = {
    id: user.id,
    name: fullName || user.email?.split("@")[0] || "MIRAI Member",
    email: user.email || "",
    createdAt: user.created_at,
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold uppercase tracking-[0.25em] text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {"MIR\u039BI"}
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs uppercase tracking-widest gap-2">
            <LogOut className="w-3.5 h-3.5" /> Esci
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Il tuo account
        </h1>
        <p className="text-muted-foreground mb-10">
          Gestisci le informazioni del tuo profilo
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Profilo</h2>
                <p className="text-xs text-muted-foreground">I tuoi dati personali</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Nome</p>
                <p className="text-sm text-foreground">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : "Non specificato"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <p className="text-sm text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Ruolo</p>
                <p className="text-sm text-foreground capitalize">{profile?.role || "user"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Membro dal</p>
                <p className="text-sm text-foreground">
                  {new Date(user.created_at).toLocaleDateString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Ordini</h2>
                  <p className="text-xs text-muted-foreground">I tuoi ordini recenti</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Nessun ordine ancora. Inizia a esplorare il nostro catalogo.
              </p>
              <Link
                href="/#prodotti"
                className="inline-flex items-center gap-1 mt-4 text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
              >
                Esplora prodotti
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <CommunityPreview member={communityMember} />
      </div>
    </div>
  )
}
