import type { SupabaseClient } from "@supabase/supabase-js"

export type DiscountType = "percentage" | "fixed"

export type DiscountCodeRow = {
  code: string
  discount_type: DiscountType
  value: number | string
  active: boolean
  first_order_only: boolean
  minimum_subtotal: number | string | null
  starts_at: string | null
  ends_at: string | null
  max_uses: number | null
  times_used: number | null
}

export type AppliedDiscount = {
  code: string
  type: DiscountType
  value: number
  subtotalCents: number
  discountCents: number
  totalCents: number
}

const FALLBACK_MIRAI10: DiscountCodeRow = {
  code: "MIRAI10",
  discount_type: "percentage",
  value: 10,
  active: true,
  first_order_only: true,
  minimum_subtotal: 0,
  starts_at: null,
  ends_at: null,
  max_uses: null,
  times_used: 0,
}

function parseEnvironmentDiscountCodes() {
  const raw = process.env.MIRAI_DISCOUNT_CODES?.trim()
  if (!raw) return [FALLBACK_MIRAI10]

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [FALLBACK_MIRAI10]

    const configuredCodes = parsed.flatMap((entry): DiscountCodeRow[] => {
      if (!entry || typeof entry !== "object") return []
      const candidate = entry as Record<string, unknown>
      const code = normalizeDiscountCode(candidate.code)
      const discountType: DiscountType =
        candidate.discount_type === "fixed" || candidate.type === "fixed"
          ? "fixed"
          : "percentage"
      const value = Number(candidate.value)
      if (!code || !Number.isFinite(value) || value <= 0) return []
      if (discountType === "percentage" && value > 100) return []

      const numberOrNull = (input: unknown) => {
        if (input === null || input === undefined || input === "") return null
        const number = Number(input)
        return Number.isFinite(number) ? number : null
      }
      const startsAt = candidate.starts_at ?? candidate.startsAt
      const endsAt = candidate.ends_at ?? candidate.endsAt

      return [{
        code,
        discount_type: discountType,
        value,
        active: candidate.active !== false,
        first_order_only:
          candidate.first_order_only === true || candidate.firstOrderOnly === true,
        minimum_subtotal:
          numberOrNull(candidate.minimum_subtotal ?? candidate.minimumSubtotal) || 0,
        starts_at: typeof startsAt === "string" ? startsAt : null,
        ends_at: typeof endsAt === "string" ? endsAt : null,
        max_uses: numberOrNull(candidate.max_uses ?? candidate.maxUses),
        times_used: 0,
      }]
    })

    const configuredMirai10 = configuredCodes.find(
      (discount) => discount.code === FALLBACK_MIRAI10.code,
    )
    return [
      configuredMirai10 || FALLBACK_MIRAI10,
      ...configuredCodes.filter((discount) => discount.code !== FALLBACK_MIRAI10.code),
    ]
  } catch {
    console.error("MIRAI_DISCOUNT_CODES non contiene un JSON valido")
    return [FALLBACK_MIRAI10]
  }
}

export function getEnvironmentDiscountCodes() {
  return parseEnvironmentDiscountCodes()
}

export function normalizeDiscountCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/\s+/g, "")
    : ""
}

function isMissingDiscountSchema(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01"
    || error?.message?.toLowerCase().includes("discount_codes") === true
}

async function loadDiscountCode(supabase: SupabaseClient, requestedCode: string) {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("code, discount_type, value, active, first_order_only, minimum_subtotal, starts_at, ends_at, max_uses, times_used")
    .eq("code", requestedCode)
    .maybeSingle()

  // Keeps codes operational while the optional database migration is deferred.
  // Once the table exists, its values always win.
  if (error && isMissingDiscountSchema(error)) {
    return getEnvironmentDiscountCodes()
      .find((discount) => discount.code === requestedCode) || null
  }
  if (error) throw new Error("Non è stato possibile verificare il codice sconto")

  return data as DiscountCodeRow | null
}

function calculateDiscountCents(row: DiscountCodeRow, subtotalCents: number) {
  const value = Number(row.value)
  if (row.discount_type === "percentage") {
    return Math.min(subtotalCents, Math.round(subtotalCents * value / 100))
  }

  return Math.min(subtotalCents, Math.round(value * 100))
}

export async function validateDiscountCode({
  supabase,
  code,
  customerEmail,
  subtotalCents,
}: {
  supabase: SupabaseClient
  code: unknown
  customerEmail: string
  subtotalCents: number
}): Promise<AppliedDiscount> {
  const normalizedCode = normalizeDiscountCode(code)
  if (!normalizedCode) throw new Error("Inserisci un codice sconto")
  if (!Number.isInteger(subtotalCents) || subtotalCents <= 0) {
    throw new Error("Il carrello non contiene prodotti scontabili")
  }

  const discount = await loadDiscountCode(supabase, normalizedCode)
  if (!discount) throw new Error("Codice sconto non valido")
  if (!discount.active) throw new Error("Questo codice sconto non è attivo")

  const now = Date.now()
  if (discount.starts_at && new Date(discount.starts_at).getTime() > now) {
    throw new Error("Questo codice sconto non è ancora attivo")
  }
  if (discount.ends_at && new Date(discount.ends_at).getTime() <= now) {
    throw new Error("Questo codice sconto è scaduto")
  }
  if (
    discount.max_uses !== null
    && Number(discount.times_used || 0) >= discount.max_uses
  ) {
    throw new Error("Questo codice sconto ha raggiunto il limite di utilizzi")
  }

  const minimumSubtotalCents = Math.round(Number(discount.minimum_subtotal || 0) * 100)
  if (subtotalCents < minimumSubtotalCents) {
    throw new Error(
      `Questo codice richiede un subtotale minimo di €${(minimumSubtotalCents / 100).toFixed(2)}`,
    )
  }

  if (discount.first_order_only) {
    const normalizedEmail = customerEmail.trim().toLowerCase()
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("email", normalizedEmail)
      .neq("status", "cancelled")

    if (error) throw new Error("Non è stato possibile verificare l'idoneità al primo ordine")
    if ((count || 0) > 0) {
      throw new Error("Questo codice è riservato al primo ordine")
    }
  }

  const discountCents = calculateDiscountCents(discount, subtotalCents)
  if (discountCents <= 0) throw new Error("Il codice non produce uno sconto applicabile")

  return {
    code: discount.code,
    type: discount.discount_type,
    value: Number(discount.value),
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  }
}

export async function recordDiscountUsage(
  supabase: SupabaseClient,
  code: string | null | undefined,
) {
  const normalizedCode = normalizeDiscountCode(code)
  if (!normalizedCode) return

  const { error } = await supabase.rpc("increment_discount_code_usage", {
    p_code: normalizedCode,
  })

  // An order must never fail only because the analytics counter is unavailable.
  if (error && !isMissingDiscountSchema(error)) {
    console.error("Impossibile aggiornare il contatore del codice sconto", error)
  }
}
