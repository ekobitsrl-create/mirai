"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2, KeyRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.")
      return
    }
    if (password !== repeatPassword) {
      setError("Le password non corrispondono.")
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password })
      if (updateError) throw updateError
      setSaved(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento non riuscito")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <section className="w-full max-w-md border border-border bg-card p-8">
        <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
          {saved ? <CheckCircle2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          {saved ? "Password aggiornata" : "Scegli una nuova password"}
        </h1>

        {saved ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">La nuova password del tuo MIRΛI PASS e attiva.</p>
            <Link href="/auth/login" className="mt-7 inline-flex min-h-11 w-full items-center justify-center bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Vai al login
            </Link>
          </>
        ) : (
          <form onSubmit={submit} className="mt-7">
            {!ready && (
              <p className="mb-5 border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Apri questa pagina dal link ricevuto via email.
              </p>
            )}
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Nuova password</Label>
              <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 bg-secondary" />
            </div>
            <div className="mt-5">
              <Label htmlFor="repeat-password" className="text-xs uppercase tracking-widest text-muted-foreground">Conferma password</Label>
              <Input id="repeat-password" type="password" autoComplete="new-password" required value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} className="mt-2 bg-secondary" />
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={!ready || loading} className="mt-6 h-11 w-full uppercase tracking-widest">
              {loading ? "Aggiornamento..." : "Aggiorna password"}
            </Button>
          </form>
        )}
      </section>
    </main>
  )
}
