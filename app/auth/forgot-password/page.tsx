"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const redirectTo = new URL("/auth/update-password", window.location.origin).toString()
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo },
      )
      if (resetError) throw resetError
      setSent(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Invio non riuscito")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <section className="w-full max-w-md border border-border bg-card p-8">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Torna al login
        </Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Recupera la password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Inserisci l'email del tuo MIRAI PASS. Riceverai un link sicuro per scegliere una nuova password.
        </p>

        {sent ? (
          <div className="mt-7 border border-primary/25 bg-primary/5 p-5 text-sm leading-6 text-foreground">
            Controlla la posta in arrivo. Se l'indirizzo e registrato, il link arrivera tra pochi minuti.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 bg-secondary"
              placeholder="nome@esempio.com"
            />
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-6 h-11 w-full uppercase tracking-widest">
              {loading ? "Invio in corso..." : "Invia link"}
            </Button>
          </form>
        )}
      </section>
    </main>
  )
}
