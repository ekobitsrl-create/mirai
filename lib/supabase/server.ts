import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = 'https://xbendkxwuaqrxsyrmgye.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZW5ka3h3dWFxcnhzeXJtZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDE5NDYsImV4cCI6MjA4NzA3Nzk0Nn0.QAnZGtZy2ebu7RCdeWFJr5SQo3XXdJOL3aUe5MMJmb4'
const SUPABASE_ADMIN_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''

async function getAccessToken() {
  const cookieStore = await cookies()
  return cookieStore.get('sb-access-token')?.value || null
}

export async function createUserClient() {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  if (SUPABASE_ADMIN_KEY) {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ADMIN_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })
}

export async function createClient() {
  const key = SUPABASE_ADMIN_KEY || SUPABASE_ANON_KEY
  return createSupabaseClient(SUPABASE_URL, key)
}

export async function getServerUser() {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  const client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getServerUserWithProfile() {
  const accessToken = await getAccessToken()
  if (!accessToken) return { user: null, profile: null }

  const client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return { user: null, profile: null }

  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}
