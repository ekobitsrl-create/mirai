export const QUICK_PAYMENT_METHOD_STORAGE_KEY = "mirai_quick_payment_method"
export const QUICK_PAYMENT_METHOD_QUERY_KEY = "payment_method"

export const QUICK_PAYMENT_METHODS = ["paypal", "klarna", "scalapay"] as const

export type QuickPaymentMethod = (typeof QUICK_PAYMENT_METHODS)[number]

export function parseQuickPaymentMethod(value: unknown): QuickPaymentMethod | null {
  return typeof value === "string" && QUICK_PAYMENT_METHODS.includes(value as QuickPaymentMethod)
    ? value as QuickPaymentMethod
    : null
}
