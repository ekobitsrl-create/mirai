import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

type LooseDatabase = any

function requiredPublicEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Variabile ambiente pubblica mancante: ${name}`)
  return value
}

let client: SupabaseClient<LooseDatabase> | null = null

export function createClient(): SupabaseClient<LooseDatabase> {
  if (client) return client

  client = createSupabaseClient<LooseDatabase>(
    requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    requiredPublicEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
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
