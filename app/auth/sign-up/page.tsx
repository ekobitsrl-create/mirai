"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { BrandMark } from "@/components/brand-mark"

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/community/hub"
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get("next"))
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState(() => searchParams.get("email") || "")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Inserisci un indirizzo email valido")
      setIsLoading(false)
      return
    }

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
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email: normalizedEmail,
          password,
          marketingConsent,
          next: nextPath,
        }),
      })

      const result = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) {
        throw new Error(result.error || "La registrazione non è andata a buon fine. Riprova tra poco.")
      }

      router.push(`/auth/sign-up-success?next=${encodeURIComponent(nextPath)}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Si e verificato un errore")
    } finally {
      setIsLoading(false)
    }
  }

  const loginHref = `/auth/login?redirectTo=${encodeURIComponent(nextPath)}`

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <Link href="/">
            <BrandMark className="text-xl text-white" />
          </Link>

          <div className="w-full border border-border rounded-lg p-8 bg-card">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Entra nella MIRΛI Society</h1>
              <p className="text-sm text-muted-foreground">Crea il tuo account per accedere alla community, alle anteprime e agli eventi.</p>
            </div>

            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="first-name" className="text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
                    <Input id="first-name" type="text" placeholder="Mario" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="last-name" className="text-xs uppercase tracking-widest text-muted-foreground">Cognome</Label>
                    <Input id="last-name" type="text" placeholder="Rossi" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="nome@esempio.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="repeat-password" className="text-xs uppercase tracking-widest text-muted-foreground">Conferma Password</Label>
                  <Input id="repeat-password" type="password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className="bg-secondary border-border text-foreground" />
                </div>
                <div className="flex items-start gap-3 border-t border-border pt-5">
                  <Checkbox
                    id="signup-marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                  />
                  <Label htmlFor="signup-marketing-consent" className="cursor-pointer text-sm font-normal leading-5 text-muted-foreground">
                    Desidero ricevere novità, offerte e vantaggi riservati della community MIRΛI via email. Posso revocare il consenso in qualsiasi momento. Consulta la{" "}
                    <Link href="/privacy" className="text-foreground underline underline-offset-4">Privacy Policy</Link>.
                  </Label>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="h-11 w-full bg-primary text-xs uppercase tracking-widest text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Creazione in corso..." : "Crea account Society"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Hai gia un account? <Link href={loginHref} className="text-foreground underline underline-offset-4 transition-colors hover:text-primary">Accedi</Link>
              </div>
            </form>
          </div>

          <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">Torna alla home</Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}
