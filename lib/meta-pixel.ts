import { getCatalogItemId } from "@/lib/catalog-identifiers"

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ""
export const META_CONSENT_EVENT = "mirai:cookie-consent"
export const META_PIXEL_READY_EVENT = "mirai:meta-pixel-ready"

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"

export type MetaCommerceItem = {
  id: string
  quantity: number
  item_price?: number
}

export type MetaCommerceParameters = {
  content_ids: string[]
  content_type: "product"
  value: number
  currency: string
  contents?: MetaCommerceItem[]
  num_items?: number
}

type MetaCartItem = {
  productId: string
  size: string
  price: number
  quantity: number
  metaContentId?: string
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function hasMetaConsent() {
  if (typeof document === "undefined") return false

  return document.cookie
    .split("; ")
    .some((row) => row === "cookie_consent=all")
}

export function trackMetaEvent(
  eventName: MetaEventName,
  parameters?: MetaCommerceParameters,
  eventId?: string,
) {
  if (!META_PIXEL_ID || typeof window === "undefined" || !hasMetaConsent() || !window.fbq) {
    return false
  }

  if (parameters && eventId) {
    window.fbq("track", eventName, parameters, { eventID: eventId })
  } else if (parameters) {
    window.fbq("track", eventName, parameters)
  } else {
    window.fbq("track", eventName)
  }

  return true
}

export function buildMetaCartParameters(
  items: MetaCartItem[],
  value: number,
  currency = "EUR",
): MetaCommerceParameters {
  const contents = items.map((item) => ({
    id: item.metaContentId || getCatalogItemId({ id: item.productId }, item.size || "OS"),
    quantity: item.quantity,
    item_price: Number(item.price),
  }))

  return {
    content_ids: [...new Set(contents.map((item) => item.id))],
    content_type: "product",
    value: Number(value.toFixed(2)),
    currency: currency.toUpperCase(),
    contents,
    num_items: items.reduce((total, item) => total + item.quantity, 0),
  }
}

export function getMetaPurchaseStorageKey(orderId: string) {
  return `mirai-meta-purchase:${orderId}`
}

export function isMetaCommerceParameters(value: unknown): value is MetaCommerceParameters {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<MetaCommerceParameters>

  return Array.isArray(candidate.content_ids)
    && candidate.content_ids.every((id) => typeof id === "string" && id.length > 0)
    && candidate.content_type === "product"
    && typeof candidate.value === "number"
    && Number.isFinite(candidate.value)
    && typeof candidate.currency === "string"
    && candidate.currency.length === 3
}
