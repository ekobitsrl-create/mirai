export const GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID = 5824924831

export type GoogleCustomerReviewOrder = {
  orderId: string
  email: string
  deliveryCountry: string
  estimatedDeliveryDate: string
  products?: Array<{ gtin: string }>
}

export function getEstimatedDeliveryDate(maximumBusinessDays: number, from = new Date()) {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  let remainingDays = Math.max(1, Math.ceil(maximumBusinessDays))

  while (remainingDays > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    const day = date.getUTCDay()
    if (day !== 0 && day !== 6) remainingDays -= 1
  }

  return date.toISOString().slice(0, 10)
}

export function getGoogleReviewStorageKey(orderId: string) {
  return `mirai-google-review-order:${orderId}`
}

export function isGoogleCustomerReviewOrder(value: unknown): value is GoogleCustomerReviewOrder {
  if (!value || typeof value !== "object") return false
  const order = value as Partial<GoogleCustomerReviewOrder>

  return Boolean(
    order.orderId
      && order.email
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)
      && /^[A-Z]{2}$/.test(order.deliveryCountry || "")
      && /^\d{4}-\d{2}-\d{2}$/.test(order.estimatedDeliveryDate || ""),
  )
}
