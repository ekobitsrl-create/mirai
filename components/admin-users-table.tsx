"use client"

import { useState } from "react"
import { updateUserRole } from "@/app/admin/actions"
import { Shield, User, Users } from "lucide-react"

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  created_at: string
}

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Totale Utenti</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <p className="text-2xl font-bold text-primary">{users.filter((u) => u.role === "admin").length}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Clienti</p>
          <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.role === "user").length}</p>
        </div>
      </div>

      {/* User list */}
      {users.map((user) => (
        <div key={user.id} className="border border-border rounded-lg bg-card p-6 flex items-center gap-6">
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
            <div className="flex items-center gap-3 mb-1">
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
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{user.email || "Nessuna email"}</span>
              <span>
                Registrato il{" "}
                {new Date(user.created_at).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Role toggle */}
          <div className="flex-shrink-0">
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
          </div>
        </div>
      ))}
    </div>
  )
}
