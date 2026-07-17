"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Le password non corrispondono")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/confirm?next=/community`,
          data: {
            first_name: firstName,
            last_name: lastName,
            membership: "mirai-pass",
          },
        },
      })
      if (error) throw error

      if (data.session) {
        const response = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        })
        if (!response.ok) throw new Error("Impossibile attivare il MIRAI PASS")
        window.location.href = "/community"
        return
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Si è verificato un errore")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <Link href="/">
            <Image src="/images/logo.png" alt="MIRAI" width={120} height={40} className="invert" style={{ width: 'auto', height: 'auto' }} />
          </Link>

          <div className="w-full border border-border rounded-lg p-8 bg-card">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
                Crea il tuo MIRAI PASS
              </h1>
              <p className="text-sm text-muted-foreground">
                Un solo account per shop, community, anteprime ed eventi.
              </p>
            </div>

            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="first-name" className="text-xs uppercase tracking-widest text-muted-foreground">
                      Nome
                    </Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="Mario"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="last-name" className="text-xs uppercase tracking-widest text-muted-foreground">
                      Cognome
                    </Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Rossi"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor="repeat-password" className="text-xs uppercase tracking-widest text-muted-foreground">
                    Conferma Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
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
                  {isLoading ? "Creazione in corso..." : "Crea MIRAI PASS"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {"Hai già un account? "}
                <Link
                  href="/auth/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Accedi
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
