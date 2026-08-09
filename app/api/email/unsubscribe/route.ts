import { NextRequest, NextResponse } from "next/server"
import { readUnsubscribeToken, unsubscribeMarketingEmail } from "@/lib/email/abandoned-cart"

function page(title: string, message: string, status = 200) {
  return new NextResponse(`<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0712;color:#f8f7fb;font-family:Arial,sans-serif">
  <main style="width:min(520px,calc(100% - 40px));border:1px solid #302142;background:#130c20;padding:36px;box-sizing:border-box">
    <div style="font-size:22px;font-weight:800;letter-spacing:7px">MIRAI</div>
    <h1 style="margin:34px 0 12px;font-size:27px">${title}</h1>
    <p style="margin:0;color:#c9c2d2;line-height:1.7">${message}</p>
  </main>
</body>
</html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

async function unsubscribe(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || ""
  const email = readUnsubscribeToken(token)
  if (!email) {
    return page("Link non valido", "Il link di disiscrizione non e valido o non e piu utilizzabile.", 400)
  }

  try {
    await unsubscribeMarketingEmail(email)
    return page("Disiscrizione completata", "Non riceverai altre email promozionali o promemoria MIRAI.")
  } catch (error) {
    console.error("Disiscrizione email non riuscita", error)
    return page("Operazione non riuscita", "Riprova tra qualche minuto o scrivi a info@mirailabstore.com.", 500)
  }
}

export const GET = unsubscribe

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || ""
  const email = readUnsubscribeToken(token)
  if (!email) return new NextResponse(null, { status: 400 })

  try {
    await unsubscribeMarketingEmail(email)
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Disiscrizione one-click non riuscita", error)
    return new NextResponse(null, { status: 500 })
  }
}
