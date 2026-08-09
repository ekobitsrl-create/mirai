import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

type LooseDatabase = any

// Next.js replaces NEXT_PUBLIC_* variables in browser bundles only when they
// are referenced statically. Dynamic access such as process.env[name] works
// on the server but becomes undefined in production client chunks.
const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const publicSupabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim()

function requiredPublicEnvironment(value: string | undefined, name: string) {
  if (!value) throw new Error(`Variabile ambiente pubblica mancante: ${name}`)
  return value
}

let client: SupabaseClient<LooseDatabase> | null = null

export function createClient(): SupabaseClient<LooseDatabase> {
  if (client) return client

  client = createSupabaseClient<LooseDatabase>(
    requiredPublicEnvironment(publicSupabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    requiredPublicEnvironment(
      publicSupabaseKey,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  )
  return client
}
