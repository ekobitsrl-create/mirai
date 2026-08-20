"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Loader2, MessageCircleMore, Send, ShieldCheck, Trash2 } from "lucide-react"
import { COMMUNITY_MESSAGE_MAX_LENGTH, formatCommunityDate, type CommunityMessage } from "@/lib/community"
import { createClient } from "@/lib/supabase/client"

type Props = {
  initialMessages: CommunityMessage[]
  currentUserId: string
  isAdmin: boolean
}

type ChatApiResult =
  | { ok: true; message?: CommunityMessage }
  | { ok: false; error: string }

async function mutateMessage(method: "POST" | "DELETE", payload: Record<string, string>): Promise<ChatApiResult> {
  const response = await fetch("/api/community/messages", {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => null) as ChatApiResult | null

  if (!result) return { ok: false, error: "Risposta non valida. Aggiorna la chat e riprova." }
  if (!response.ok && result.ok) return { ok: false, error: "Operazione non riuscita." }
  return result
}

export function CommunityChat({ initialMessages, currentUserId, isAdmin }: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMessages(initialMessages), [initialMessages])
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages])

  useEffect(() => {
    const supabase = createClient()
    let active = true
    const channel = supabase
      .channel("mirai-community-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => {
          if (!active) return
          const message = payload.new as CommunityMessage
          setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_messages" },
        (payload) => {
          if (!active) return
          const deletedId = String(payload.old?.id || "")
          if (deletedId) setMessages((current) => current.filter((item) => item.id !== deletedId))
        },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [])

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    setIsSending(true)
    setError(null)
    try {
      const result = await mutateMessage("POST", { body })
      if (!result.ok) setError(result.error)
      else if (result.message) {
        const sentMessage = result.message
        setMessages((current) => current.some((item) => item.id === sentMessage.id) ? current : [...current, sentMessage])
        setBody("")
      } else {
        setError("Il server non ha restituito il messaggio. Aggiorna la chat e riprova.")
      }
    } catch {
      setError("Connessione interrotta. Il messaggio potrebbe essere stato inviato: aggiorna la chat prima di riprovare.")
    } finally {
      setIsSending(false)
    }
  }

  const removeMessage = async (messageId: string) => {
    setDeletingId(messageId)
    setError(null)
    try {
      const result = await mutateMessage("DELETE", { messageId })
      if (!result.ok) setError(result.error)
      else setMessages((current) => current.filter((item) => item.id !== messageId))
    } catch {
      setError("Connessione interrotta. Aggiorna la chat e riprova.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-10 pt-36 text-white sm:px-6 sm:pt-40">
      <Link href="/community/hub" className="inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Society Hub
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">Live members chat</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Society Chat.</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Solo membri e admin
        </div>
      </header>

      <section className="mt-8 flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-primary/25 bg-[#120d19] shadow-[0_25px_80px_rgba(0,0,0,.4)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 text-xs text-white/45">
          <MessageCircleMore className="h-4 w-4 text-primary" /> Canale privato MIRAI Society
        </div>

        <div className="max-h-[62vh] flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && <p className="py-20 text-center text-sm text-white/35">La chat è aperta. Inizia la conversazione.</p>}
          {messages.map((message) => {
            const mine = message.author_id === currentUserId
            return (
              <div key={message.id} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${mine ? "bg-primary text-white" : "border border-white/10 bg-white/[0.04] text-white"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`truncate text-[9px] font-bold uppercase tracking-[0.12em] ${mine ? "text-white/85" : "text-primary"}`}>{message.author_name}</span>
                      {message.author_role === "admin" && <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-label="Admin" />}
                    </div>
                    {(isAdmin || mine) && (
                      <button type="button" onClick={() => void removeMessage(message.id)} disabled={deletingId === message.id} aria-label="Elimina messaggio" className="opacity-45 hover:opacity-100">
                        {deletingId === message.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                  <p className={`mt-1.5 text-[9px] ${mine ? "text-white/55" : "text-white/25"}`}>{formatCommunityDate(message.created_at)}</p>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-white/10 p-4 sm:p-5">
          <div className="flex items-end gap-3">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              maxLength={COMMUNITY_MESSAGE_MAX_LENGTH}
              rows={2}
              placeholder="Scrivi alla Society..."
              className="min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-primary/60"
            />
            <button type="submit" disabled={isSending || !body.trim()} aria-label="Invia messaggio" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40">
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        </form>
      </section>
    </div>
  )
}
