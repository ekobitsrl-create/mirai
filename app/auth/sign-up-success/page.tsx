import Link from "next/link"
import { Mail } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <Link href="/">
            <BrandMark className="text-xl text-white" />
          </Link>

          <div className="w-full border border-border rounded-lg p-8 bg-card text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground mb-3">
              Controlla la tua email
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ti abbiamo inviato il link per attivare il tuo account MIRΛI Society. Dopo la
              conferma entrerai direttamente nel Society Hub.
            </p>
          </div>

          <Link href="/auth/login" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  )
}
