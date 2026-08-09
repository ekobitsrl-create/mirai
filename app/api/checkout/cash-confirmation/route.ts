import { NextRequest, NextResponse } from "next/server"
import { validCashOnDeliveryConfirmation } from "@/lib/checkout-confirmation"
import {
  consumeRateLimit,
  contentLengthWithin,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/request-security"

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine non valida" }, { status: 403 })
  }
  if (!contentLengthWithin(request, 4 * 1024)) {
    return NextResponse.json({ error: "Richiesta troppo grande" }, { status: 413 })
  }
  if (!await consumeRateLimit({
    bucket: "cash-order-confirmation",
    limit: 20,
    windowSeconds: 600,
    request,
  })) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 })
  }

  let payload: { orderId?: unknown; confirmationToken?: unknown }
  try {
    payload = await readJsonBody(request, 4 * 1024)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Richiesta troppo grande" }, { status: 413 })
    }
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 })
  }

  const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : ""
  const confirmationToken = typeof payload.confirmationToken === "string"
    ? payload.confirmationToken.trim()
    : null
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)
    || !validCashOnDeliveryConfirmation(orderId, confirmationToken)) {
    return NextResponse.json({ error: "Ordine non disponibile" }, { status: 404 })
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, private" } },
  )
}
