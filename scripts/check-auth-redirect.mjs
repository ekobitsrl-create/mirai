// Read-only smoke check: an intentionally invalid token reveals Supabase's
// fallback URL without sending email or using anyone's recovery token.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xbendkxwuaqrxsyrmgye.supabase.co"
const expectedOrigin = "https://www.mirailabstore.com"
const verifyUrl = new URL("/auth/v1/verify", supabaseUrl)
verifyUrl.searchParams.set("token", "mirai-invalid-recovery-config-check")
verifyUrl.searchParams.set("type", "recovery")

const response = await fetch(verifyUrl, {
  redirect: "manual",
  signal: AbortSignal.timeout(10_000),
})
const location = response.headers.get("location")
const destination = location ? new URL(location) : null

if (response.status !== 303 || destination?.origin !== expectedOrigin) {
  console.error(`FAIL: Supabase recovery redirects to ${destination?.origin || "no destination"} (HTTP ${response.status}). Set Authentication > URL Configuration > Site URL to ${expectedOrigin}.`)
  process.exitCode = 1
} else {
  console.log(`PASS: Supabase recovery fallback stays on ${expectedOrigin}.`)
}
