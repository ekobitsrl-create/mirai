import "server-only"

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"

export const CHECKOUT_CONFIRMATION_METADATA_KEY = "confirmation_token_hash"

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest()
}

export function createCheckoutConfirmation() {
  const token = randomBytes(32).toString("base64url")
  return { token, hash: tokenHash(token).toString("hex") }
}

export function validCheckoutConfirmation(token: string | null, expectedHash: string | null | undefined) {
  if (!token || !expectedHash || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false
  if (token.length > 128) return false

  const actual = tokenHash(token)
  const expected = Buffer.from(expectedHash, "hex")
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function cashConfirmationSecret() {
  const secret = process.env.CHECKOUT_CONFIRMATION_SECRET?.trim()
    || process.env.CRON_SECRET?.trim()
    || process.env.SUPABASE_SECRET_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!secret) throw new Error("Checkout confirmation secret non configurato")
  return secret
}

export function createCashOnDeliveryConfirmation(orderId: string) {
  return createHmac("sha256", cashConfirmationSecret())
    .update(`cash-on-delivery:${orderId}`)
    .digest("base64url")
}

export function validCashOnDeliveryConfirmation(orderId: string, token: string | null) {
  if (!token || token.length > 128) return false
  const expected = Buffer.from(createCashOnDeliveryConfirmation(orderId))
  const actual = Buffer.from(token)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
