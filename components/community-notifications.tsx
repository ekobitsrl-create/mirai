"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, Heart, Loader2, MessageCircle, X } from "lucide-react"
import { formatCommunityDate, type CommunityNotification } from "@/lib/community"
import { useLanguage } from "@/lib/language-context"
import { translateSiteText } from "@/lib/site-localization"

type NotificationsResponse = {
  ok: boolean
  notifications?: CommunityNotification[]
  unreadCount?: number
  error?: string
}

export function CommunityNotifications() {
  const router = useRouter()
  const { locale } = useLanguage()
  const ui = useCallback((value: string) => translateSiteText(value, locale), [locale])
  const panelRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [notifications, setNotifications] = useState<CommunityNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await fetch("/api/community/notifications", {
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const result = await response.json() as NotificationsResponse
      if (!response.ok || !result.ok) throw new Error(result.error || "Non è stato possibile caricare le notifiche.")
      setNotifications(result.notifications || [])
      setUnreadCount(result.unreadCount || 0)
      setError(null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Non è stato possibile caricare le notifiche.")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNotifications(true)
    const intervalId = window.setInterval(() => void loadNotifications(), 30_000)
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadNotifications()
    }
    window.addEventListener("focus", refreshWhenVisible)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refreshWhenVisible)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [loadNotifications])

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen])

  const updateReadState = async (payload: { notificationId?: string; markAll?: boolean }) => {
    const response = await fetch("/api/community/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("Non è stato possibile aggiornare le notifiche.")
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return
    setIsMarkingAll(true)
    try {
      await updateReadState({ markAll: true })
      const readAt = new Date().toISOString()
      setNotifications((current) => current.map((notification) => ({ ...notification, read_at: notification.read_at || readAt })))
      setUnreadCount(0)
      setError(null)
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Non è stato possibile aggiornare le notifiche.")
    } finally {
      setIsMarkingAll(false)
    }
  }

  const openNotification = (notification: CommunityNotification) => {
    if (!notification.read_at) {
      const readAt = new Date().toISOString()
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item))
      setUnreadCount((current) => Math.max(0, current - 1))
      void updateReadState({ notificationId: notification.id }).catch(() => void loadNotifications())
    }

    setIsOpen(false)
    const targetId = `post-${notification.post_id}`
    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
        window.history.replaceState(null, "", `#${targetId}`)
      } else {
        router.push(`/community/social#${targetId}`)
      }
    })
  }

  return (
    <div ref={panelRef} className="relative z-40">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current)
          if (!isOpen) void loadNotifications()
        }}
        aria-label={ui("Apri notifiche")}
        aria-expanded={isOpen}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-white shadow-[0_10px_35px_rgba(139,60,246,.15)] transition hover:border-primary/70 hover:bg-primary/20"
      >
        <Bell className="h-5 w-5 transition group-hover:rotate-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#08070b] bg-primary px-1 text-[9px] font-black text-white" aria-label={`${unreadCount} ${ui("notifiche non lette")}`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-24 z-[110] max-h-[min(72vh,620px)] overflow-hidden rounded-[1.5rem] border border-primary/30 bg-[#110b19]/[.98] shadow-[0_30px_100px_rgba(0,0,0,.7),0_0_70px_rgba(139,60,246,.16)] backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[390px]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.24em] text-primary">MIRAI Society</p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{ui("Notifiche")}</h2>
                {unreadCount > 0 && <span className="rounded-full bg-primary/15 px-2 py-1 text-[9px] font-bold text-primary">{unreadCount} {ui("nuove")}</span>}
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label={ui("Chiudi notifiche")} className="rounded-full border border-white/10 p-2 text-white/50 hover:border-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <p className="text-[10px] text-white/40">{unreadCount > 0 ? `${unreadCount} ${ui("da leggere")}` : ui("Tutto aggiornato")}</p>
            <button type="button" onClick={() => void markAllAsRead()} disabled={unreadCount === 0 || isMarkingAll} className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-primary disabled:opacity-35">
              {isMarkingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
              {ui("Segna tutte come lette")}
            </button>
          </div>

          <div className="relative max-h-[calc(min(72vh,620px)-132px)] overflow-y-auto overscroll-contain">
            {isLoading && (
              <div className="flex items-center justify-center py-16 text-primary"><Loader2 className="h-6 w-6 animate-spin" /></div>
            )}
            {!isLoading && notifications.length === 0 && (
              <div className="px-8 py-14 text-center">
                <Bell className="mx-auto h-8 w-8 text-primary/50" />
                <p className="mt-4 text-sm font-bold text-white">{ui("Nessuna notifica per ora")}</p>
                <p className="mt-2 text-xs leading-5 text-white/35">{ui("Quando qualcuno interagisce con i tuoi post, lo vedrai qui.")}</p>
              </div>
            )}
            {!isLoading && notifications.map((notification) => {
              const isComment = notification.notification_type === "post_comment"
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`relative flex w-full items-start gap-3 border-b border-white/[.07] px-5 py-4 text-left transition hover:bg-white/[.05] ${notification.read_at ? "bg-transparent" : "bg-primary/[.08]"}`}
                >
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isComment ? "border-sky-400/30 bg-sky-400/10 text-sky-300" : "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"}`}>
                    {isComment ? <MessageCircle className="h-4 w-4" /> : <Heart className="h-4 w-4 fill-current" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-5 text-white/75">
                      <strong className="font-bold text-white">{notification.actor_name}</strong>{" "}
                      {ui(isComment ? "ha commentato il tuo post" : "ha messo like al tuo post")}
                    </span>
                    {notification.excerpt && <span className="mt-1.5 block truncate text-xs italic text-white/40">“{notification.excerpt}”</span>}
                    <span className="mt-2 block text-[9px] uppercase tracking-[0.12em] text-white/25">{formatCommunityDate(notification.created_at)}</span>
                  </span>
                  {!notification.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_12px_rgba(139,60,246,.9)]" />}
                </button>
              )
            })}
          </div>
          {error && <p role="alert" className="border-t border-red-400/20 bg-red-500/10 px-5 py-3 text-xs text-red-200">{ui(error)}</p>}
        </div>
      )}
    </div>
  )
}
