import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const HARDCODED_URL = 'https://xbendkxwuaqrxsyrmgye.supabase.co'
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZW5ka3h3dWFxcnhzeXJtZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDE5NDYsImV4cCI6MjA4NzA3Nzk0Nn0.QAnZGtZy2ebu7RCdeWFJr5SQo3XXdJOL3aUe5MMJmb4'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = (envUrl && envUrl.length > 10) ? envUrl : HARDCODED_URL
const SUPABASE_ANON_KEY = (envKey && envKey.length > 10) ? envKey : HARDCODED_KEY

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (client) return client
  client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}
