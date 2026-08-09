import { NextRequest, NextResponse } from "next/server"
import { sendAbandonedCartReminders } from "@/lib/email/abandoned-cart"
import { sendWelcomeCouponEmails } from "@/lib/email/welcome-coupon"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    if (request.nextUrl.searchParams.get("dryRun") === "1") {
      const welcomeCoupons = await sendWelcomeCouponEmails({ dryRun: true })
      return NextResponse.json({ ok: true, welcomeCoupons })
    }

    const abandonedCarts = await sendAbandonedCartReminders()
    const welcomeCoupons = await sendWelcomeCouponEmails()
    return NextResponse.json({ ok: true, abandonedCarts, welcomeCoupons })
  } catch (error) {
    console.error("Automazione email MIRAI non riuscita", error)
    return NextResponse.json({ error: "Invio non riuscito" }, { status: 500 })
  }
}
