export const SHIPPING_CONFIG = {
  standardDeliveryDays: { minimum: 3, maximum: 5 },
  allowedCountries: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "SE", "CH", "GB",
  ],
} as const

export function getStripeShippingOptions(_subtotalCents: number) {
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: {
          amount: 0,
          currency: "eur",
        },
        display_name: "Spedizione Standard Gratuita",
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
