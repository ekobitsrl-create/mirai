import type { SupabaseClient } from "@supabase/supabase-js"

export async function verifyEmailLink(auth: SupabaseClient["auth"], url: URL) {
  const query = url.searchParams
  const hash = new URLSearchParams(url.hash.slice(1))
  if (query.has("error") || query.has("error_code") || hash.has("error") || hash.has("error_code")) {
    throw new Error("Link non valido o scaduto")
  }

  const tokenHash = query.get("token_hash")
  const type = query.get("type")
  if (tokenHash) {
    if (type !== "signup" && type !== "magiclink" && type !== "recovery") {
      throw new Error("Tipo di link non valido")
    }
    const { data, error } = await auth.verifyOtp({ token_hash: tokenHash, type })
    if (error || !data.session) throw new Error("Link non valido o scaduto")
    return data.session
  }

  // Older emails can carry an explicit token pair. Never substitute getSession():
  // that could belong to an unrelated account already signed in on this device.
  const accessToken = hash.get("access_token")
  const refreshToken = hash.get("refresh_token")
  if (!accessToken || !refreshToken) throw new Error("Link non valido o scaduto")
  const { data, error } = await auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  if (error || !data.session) throw new Error("Link non valido o scaduto")
  return data.session
}
