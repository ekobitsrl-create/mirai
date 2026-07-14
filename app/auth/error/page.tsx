import Link from "next/link"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <Link href="/">
            <Image src="/images/logo.png" alt="MIRAI" width={120} height={40} className="invert" style={{ width: 'auto', height: 'auto' }} />
          </Link>

          <div className="w-full border border-border rounded-lg p-8 bg-card text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground mb-3">
              Si è verificato un errore
            </h1>
            {params?.error ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"Codice errore: "}{params.error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si è verificato un errore non specificato. Riprova più tardi.
              </p>
            )}
          </div>

          <div className="flex gap-6">
            <Link href="/auth/login" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Torna al login
            </Link>
            <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
