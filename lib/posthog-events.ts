"use client"

import posthog from "posthog-js"

export const POSTHOG_CONSENT_EVENT = "mirai:cookie-consent"
export const POSTHOG_READY_EVENT = "mirai:posthog-ready"

export type PostHogCommerceEventName =
  | "view_product"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"

export type PostHogCommerceItem = {
  product_id: string
  product_name?: string
  category?: string
  brand?: string
  price?: number
  currency?: string
  quantity?: number
  size?: string
}

export type PostHogCommerceProperties = {
  product_id?: string
  product_name?: string
  category?: string
  brand?: string
  price?: number
  currency?: string
  quantity?: number
  size?: string
  value?: number
  item_count?: number
  order_id?: string
  payment_method?: string
  items?: PostHogCommerceItem[]
}

export function hasPostHogConsent() {
  if (typeof document === "undefined") return false

  return document.cookie
    .split("; ")
    .some((row) => row === "cookie_consent=all")
}

export function trackPostHogEvent(
  eventName: PostHogCommerceEventName,
  properties: PostHogCommerceProperties,
) {
  if (typeof window === "undefined" || !posthog.__loaded || !hasPostHogConsent()) {
    return false
  }

  posthog.capture(eventName, properties)
  return true
}

export function trackViewProduct(properties: PostHogCommerceProperties) {
  return trackPostHogEvent("view_product", properties)
}

export function trackAddToCart(properties: PostHogCommerceProperties) {
  return trackPostHogEvent("add_to_cart", properties)
}

export function trackBeginCheckout(properties: PostHogCommerceProperties) {
  return trackPostHogEvent("begin_checkout", properties)
}

export function trackPurchase(properties: PostHogCommerceProperties) {
  return trackPostHogEvent("purchase", properties)
}
