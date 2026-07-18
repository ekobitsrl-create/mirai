"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAdminEmail } from "@/lib/admin"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (!data.session) throw new Error("Sessione non creata")

      // Store session in cookies - MUST wait for this to complete before redirect
      const sessionResponse = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      })
      
      if (!sessionResponse.ok) {
        throw new Error("Impossibile salvare la sessione")
      }

      // Check if user is admin by checking profile in database
      // Use the freshly authenticated client to query the profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const isAdmin = (profile as { role?: string } | null)?.role === 'admin' || isAdminEmail(data.user.email)
      // Respect safe internal redirects. Only the admin area requires an admin role.
      let redirectUrl = isAdmin ? '/admin' : '/account'
      const safeRedirect = typeof redirectTo === 'string' && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      if (safeRedirect && redirectTo) {
        redirectUrl = redirectTo.startsWith('/admin') && !isAdmin ? '/account' : redirectTo
      }

      // Small delay to ensure cookies are properly saved by the browser
      await new Promise(resolve => setTimeout(resolve, 100))

      // Force a full page navigation
      window.location.href = redirectUrl
      return
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Si è verificato un errore")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full border border-border rounded-lg p-8 bg-card">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                Accedi
              </h1>
              <p className="text-sm text-muted-foreground">
                Inserisci le tue credenziali per accedere al tuo account
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@esempio.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {"Non hai un account? "}
                <Link
                  href={redirectTo ? `/auth/sign-up?next=${encodeURIComponent(redirectTo)}` : "/auth/sign-up"}
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Registrati
                </Link>
              </div>
            </form>
          </div>

          <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
