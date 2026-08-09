import "server-only"

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

type LooseDatabase = any

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Variabile ambiente mancante: ${name}`)
  return value
}

function getSupabaseUrl() {
  return requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL")
}

function getAnonKey() {
  return requiredEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

function getAdminKey() {
  const key = process.env.SUPABASE_SECRET_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata")
  return key
}

async function getAccessToken() {
  const cookieStore = await cookies()
  return cookieStore.get("sb-access-token")?.value || null
}

export function createPublicClient(): SupabaseClient<LooseDatabase> {
  return createSupabaseClient<LooseDatabase>(getSupabaseUrl(), getAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function createAdminClient(): SupabaseClient<LooseDatabase> {
  return createSupabaseClient<LooseDatabase>(getSupabaseUrl(), getAdminKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function createUserClient(): Promise<SupabaseClient<LooseDatabase> | null> {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  return createSupabaseClient<LooseDatabase>(getSupabaseUrl(), getAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

// Backwards-compatible public server client. Privileged writes must explicitly use
// createAdminClient(), so importing this helper can never silently bypass RLS.
export async function createClient() {
  return createPublicClient()
}

export async function getServerUser() {
  const client = await createUserClient()
  if (!client) return null

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getServerUserWithProfile() {
  const client = await createUserClient()
  if (!client) return { user: null, profile: null }

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return { user: null, profile: null }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { user, profile }
}
