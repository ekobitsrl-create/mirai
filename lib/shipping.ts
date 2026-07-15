export const SHIPPING_CONFIG = {
  freeThresholdCents: 15_000,
  standardPriceCents: 590,
  expressPriceCents: 990,
  standardDeliveryDays: { minimum: 3, maximum: 5 },
  expressDeliveryDays: { minimum: 1, maximum: 2 },
  allowedCountries: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "SE", "CH", "GB",
  ],
} as const

export const FREE_SHIPPING_THRESHOLD_EUROS = SHIPPING_CONFIG.freeThresholdCents / 100

export function formatShippingPrice(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function getStripeShippingOptions(subtotalCents: number) {
  const standardAmount = subtotalCents >= SHIPPING_CONFIG.freeThresholdCents
    ? 0
    : SHIPPING_CONFIG.standardPriceCents

  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: {
          amount: standardAmount,
          currency: "eur",
        },
        display_name: standardAmount === 0
          ? "Spedizione Standard Gratuita"
          : "Spedizione Standard",
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
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: {
          amount: SHIPPING_CONFIG.expressPriceCents,
          currency: "eur",
        },
        display_name: "Spedizione Express",
        delivery_estimate: {
          minimum: {
            unit: "business_day" as const,
            value: SHIPPING_CONFIG.expressDeliveryDays.minimum,
          },
          maximum: {
            unit: "business_day" as const,
            value: SHIPPING_CONFIG.expressDeliveryDays.maximum,
          },
        },
      },
    },
  ]
}
