"use client"

import { useState } from "react"
import { updateUserRole } from "@/app/admin/actions"
import { Shield, ShoppingBag, Sparkles, User, Users } from "lucide-react"

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  created_at: string
  is_registered: boolean
  is_customer: boolean
  is_community_member: boolean
  order_count: number
}

type AudienceFilter = "all" | "customers" | "community"

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all")

  const customerCount = users.filter((user) => user.is_customer).length
  const communityCount = users.filter((user) => user.is_community_member).length
  const visibleUsers = users.filter((user) => {
    if (audienceFilter === "customers") return user.is_customer
    if (audienceFilter === "community") return user.is_community_member
    return true
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Cambiare il ruolo di questo utente a "${newRole}"?`)) return
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("id", userId)
      fd.set("role", newRole)
      await updateUserRole(fd)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (users.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 bg-card text-center">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nessun utente registrato</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-4">
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Tutti</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Clienti</p>
          <p className="text-2xl font-bold text-emerald-400">{customerCount}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Community</p>
          <p className="text-2xl font-bold text-fuchsia-400">{communityCount}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <p className="text-2xl font-bold text-primary">{users.filter((user) => user.role === "admin").length}</p>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2" aria-label="Filtra utenti">
        {([
          ["all", `Tutti (${users.length})`],
          ["customers", `Clienti (${customerCount})`],
          ["community", `Community (${communityCount})`],
        ] as const).map(([filter, label]) => (
          <button
            key={filter}
            type="button"
            aria-pressed={audienceFilter === filter}
            onClick={() => setAudienceFilter(filter)}
            className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              audienceFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* User list */}
      {visibleUsers.map((user) => (
        <div key={user.id} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            {user.role === "admin" ? (
              <Shield className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : "Utente"}
              </h3>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  user.role === "admin"
                    ? "text-primary border-primary/30 bg-primary/10"
                    : "text-muted-foreground border-border bg-secondary"
                }`}
              >
                {user.role}
              </span>
              {user.is_customer && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-300">
                  <ShoppingBag className="h-3 w-3" /> Cliente
                </span>
              )}
              {user.is_community_member && (
                <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-fuchsia-300">
                  <Sparkles className="h-3 w-3" /> Community
                </span>
              )}
              {!user.is_registered && (
                <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ospite
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="break-all">{user.email || "Nessuna email"}</span>
              <span>
                {user.is_registered ? "Registrato" : "Primo ordine"} il{" "}
                {new Date(user.created_at).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {user.is_customer && (
                <span>{user.order_count} {user.order_count === 1 ? "ordine" : "ordini"}</span>
              )}
            </div>
          </div>

          {/* Role toggle */}
          {user.is_registered && <div className="flex-shrink-0">
            {user.role === "admin" ? (
              <button
                onClick={() => handleRoleChange(user.id, "user")}
                disabled={isSubmitting}
                className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
              >
                Rimuovi Admin
              </button>
            ) : (
              <button
                onClick={() => handleRoleChange(user.id, "admin")}
                disabled={isSubmitting}
                className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
              >
                Rendi Admin
              </button>
            )}
          </div>}
        </div>
      ))}
    </div>
  )
}
