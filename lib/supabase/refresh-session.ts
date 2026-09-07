import { createClient } from "@supabase/supabase-js"

export async function refreshServerSession(accessToken?: string, refreshToken?: string) {
  if (!refreshToken) return null
  if (accessToken) {
    try {
      const { exp } = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString())
      // This is only a renewal hint, never an authorization check. Protected
      // pages and APIs still validate the token with Supabase's getUser / RLS.
      if (typeof exp === "number" && exp > Date.now() / 1000 + 60) return null
    } catch {
      // A malformed or expired access cookie can be replaced by a valid refresh.
    }
  }
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  )
  try {
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) return null
    return data.session
  } catch {
    // Preserve the refresh cookie on transient failures so a later request can retry.
    return null
  }
}
