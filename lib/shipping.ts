export const EU_COUNTRY_CODES = [
  "IT",
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
] as const

export type EuCountryCode = (typeof EU_COUNTRY_CODES)[number]

export const SHIPPING_CONFIG = {
  standardDeliveryDays: { minimum: 3, maximum: 5 },
  allowedCountries: EU_COUNTRY_CODES,
  italyCountryCode: "IT" as const,
  euShippingFeeCents: 4_000,
} as const

export function isEuShippingCountry(value: unknown): value is EuCountryCode {
  return (
    typeof value === "string" &&
    EU_COUNTRY_CODES.includes(value.toUpperCase() as EuCountryCode)
  )
}

export function normalizeShippingCountry(value: unknown): EuCountryCode {
  const countryCode = typeof value === "string" ? value.trim().toUpperCase() : ""

  if (!isEuShippingCountry(countryCode)) {
    throw new Error("Il Paese di spedizione deve appartenere all'Unione Europea.")
  }

  return countryCode
}

export function getShippingCostCents(countryCode: EuCountryCode): number {
  return countryCode === SHIPPING_CONFIG.italyCountryCode
    ? 0
    : SHIPPING_CONFIG.euShippingFeeCents
}

export function getStripeShippingOptions(countryCode: EuCountryCode) {
  const shippingCostCents = getShippingCostCents(countryCode)

  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: {
          amount: shippingCostCents,
          currency: "eur",
        },
        display_name:
          shippingCostCents === 0
            ? "Spedizione standard gratuita"
            : "Spedizione standard UE",
        delivery_estimate: {
          minimum: {
            unit: "business_day" as const,
            value: SHIPPING_CONFIG.standardDeliveryDays.minimum,
          },
          maximum: {
            unit: "business_day" as const,
            value: SHIPPING_CONFIG.standardDeliveryDays.maximum,
          },
        },
      },
    },
  ]
}
