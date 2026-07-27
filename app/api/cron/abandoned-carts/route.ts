import { NextRequest, NextResponse } from "next/server"
import { sendAbandonedCartReminders } from "@/lib/email/abandoned-cart"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const result = await sendAbandonedCartReminders()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("Invio promemoria carrello non riuscito", error)
    return NextResponse.json({ error: "Invio non riuscito" }, { status: 500 })
  }
}
