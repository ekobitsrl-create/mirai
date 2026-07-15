"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    await fetch('/api/auth/clear-session', { method: 'POST' })
    window.location.href = "/"
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Esci
    </button>
  )
}
