import { SITE_URL } from "@/lib/site-url"
import type { EmailContent } from "@/lib/email/resend"
import { CASH_ON_DELIVERY_FEE_EUROS } from "@/lib/checkout-fees"

export type EmailOrderItem = {
  name: string
  quantity: number
  price: number
  image?: string | null
  size?: string | null
}

export type EmailOrder = {
  id: string
  email: string
  total: number
  status: string
  shippingName?: string | null
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingZip?: string | null
  shippingCountry?: string | null
  items: EmailOrderItem[]
}

export type AbandonedCartItem = {
  name: string
  quantity: number
  price: number
  image?: string | null
  size?: string | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: "in attesa",
  confirmed: "confermato",
  processing: "in preparazione",
  shipped: "spedito",
  delivered: "consegnato",
  cancelled: "annullato",
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function money(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)
}

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function button(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${escapeHtml(label)}</a>`
}

function layout(preheader: string, title: string, body: string, footer?: string) {
  return `<!doctype html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0b0712;color:#f8f7fb;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0712">
    <tr><td align="center" style="padding:28px 14px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#130c20;border:1px solid #302142">
        <tr><td style="padding:26px 30px;border-bottom:1px solid #302142">
          <div style="font-size:22px;font-weight:800;letter-spacing:7px">MIRAI</div>
          <div style="margin-top:6px;color:#a78bfa;font-size:10px;letter-spacing:3px">LAB STORE</div>
        </td></tr>
        <tr><td style="padding:32px 30px">
          <h1 style="margin:0 0 20px;font-size:27px;line-height:1.2;letter-spacing:0">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:22px 30px;border-top:1px solid #302142;color:#aaa1b8;font-size:12px;line-height:1.7">
          ${footer || `Serve aiuto? Rispondi a questa email o scrivi a <a href="mailto:info@mirailabstore.com" style="color:#c4b5fd">info@mirailabstore.com</a>.<br>MIRAI LAB STORE, Via Umberto 95, 95129 Catania.`}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function orderRows(items: EmailOrderItem[]) {
  return items.map((item) => `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #302142">
        <div style="font-size:14px;font-weight:700">${escapeHtml(item.name)}</div>
        <div style="margin-top:4px;color:#aaa1b8;font-size:12px">
          Quantita: ${item.quantity}${item.size ? ` &nbsp; Taglia: ${escapeHtml(item.size)}` : ""}
        </div>
      </td>
      <td align="right" style="padding:13px 0;border-bottom:1px solid #302142;font-size:14px">${escapeHtml(money(item.price * item.quantity))}</td>
    </tr>`).join("")
}

function orderSummary(order: EmailOrder) {
  const address = [
    order.shippingAddress,
    [order.shippingZip, order.shippingCity].filter(Boolean).join(" "),
    order.shippingCountry,
  ].filter(Boolean).map(escapeHtml).join("<br>")

  return `
    <p style="margin:0 0 22px;color:#c9c2d2;line-height:1.7">Ordine <strong style="color:#ffffff">#${orderNumber(order.id)}</strong></p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${orderRows(order.items)}
      <tr>
        <td style="padding:17px 0;font-weight:700">Totale</td>
        <td align="right" style="padding:17px 0;font-size:18px;font-weight:700;color:#c4b5fd">${escapeHtml(money(order.total))}</td>
      </tr>
    </table>
    ${address ? `<div style="margin-top:18px;padding:18px;background:#0f0918;color:#c9c2d2;font-size:13px;line-height:1.7"><strong style="color:#ffffff">Spedizione</strong><br>${order.shippingName ? `${escapeHtml(order.shippingName)}<br>` : ""}${address}</div>` : ""}`
}

function orderText(order: EmailOrder) {
  const items = order.items
    .map((item) => `- ${item.name}${item.size ? `, taglia ${item.size}` : ""} x${item.quantity}: ${money(item.price * item.quantity)}`)
    .join("\n")
  return `Ordine #${orderNumber(order.id)}\n${items}\nTotale: ${money(order.total)}`
}

export function paidOrderTemplate(order: EmailOrder): EmailContent {
  return {
    subject: `Ordine MIRAI #${orderNumber(order.id)} confermato`,
    html: layout(
      "Pagamento ricevuto e ordine confermato.",
      "Grazie per il tuo ordine",
      `<p style="margin:0 0 24px;color:#c9c2d2;line-height:1.7">Il pagamento e andato a buon fine. Stiamo preparando il tuo ordine e ti avviseremo quando verra spedito.</p>${orderSummary(order)}<div style="margin-top:26px">${button("Vedi i tuoi ordini", `${SITE_URL}/account`)}</div>`,
    ),
    text: `Grazie per il tuo ordine MIRAI.\nIl pagamento e andato a buon fine e inizieremo a prepararlo.\n\n${orderText(order)}\n\nAssistenza: info@mirailabstore.com`,
  }
}

export function cashOnDeliveryTemplate(order: EmailOrder): EmailContent {
  return {
    subject: `Ordine MIRAI #${orderNumber(order.id)} ricevuto`,
    html: layout(
      "Ordine in contrassegno ricevuto.",
      "Il tuo ordine e stato ricevuto",
      `<p style="margin:0 0 24px;color:#c9c2d2;line-height:1.7">Hai scelto il pagamento in contrassegno. Pagherai al corriere alla consegna; il totale include il supplemento fisso di ${escapeHtml(money(CASH_ON_DELIVERY_FEE_EUROS))}. Ti avviseremo quando l'ordine verra spedito.</p>${orderSummary(order)}`,
    ),
    text: `Abbiamo ricevuto il tuo ordine MIRAI con pagamento in contrassegno.\nPagherai al corriere alla consegna; il totale include il supplemento fisso di ${money(CASH_ON_DELIVERY_FEE_EUROS)}.\n\n${orderText(order)}\n\nAssistenza: info@mirailabstore.com`,
  }
}

export function adminOrderNotificationTemplate(
  order: EmailOrder,
  paymentMethod: "stripe" | "cash_on_delivery",
): EmailContent {
  const paymentLabel = paymentMethod === "cash_on_delivery" ? "Contrassegno" : "Carta (Stripe)"
  const contact = [
    order.shippingName ? `Cliente: ${escapeHtml(order.shippingName)}` : "",
    `Email: ${escapeHtml(order.email)}`,
    `Pagamento: ${escapeHtml(paymentLabel)}`,
  ].filter(Boolean).join("<br>")

  return {
    subject: `Nuovo ordine #${orderNumber(order.id)} - ${money(order.total)}`,
    html: layout(
      `Nuovo ordine ricevuto (${paymentLabel}).`,
      "Nuovo ordine ricevuto",
      `<p style="margin:0 0 22px;color:#c9c2d2;line-height:1.7">E arrivato un nuovo ordine sullo store.</p><div style="margin:0 0 22px;padding:18px;background:#0f0918;color:#c9c2d2;font-size:13px;line-height:1.7">${contact}</div>${orderSummary(order)}<div style="margin-top:26px">${button("Apri il pannello ordini", `${SITE_URL}/admin`)}</div>`,
    ),
    text: `Nuovo ordine ricevuto (${paymentLabel}).\nCliente: ${order.shippingName || "-"}\nEmail: ${order.email}\n\n${orderText(order)}\n\nPannello: ${SITE_URL}/admin`,
  }
}

export function paymentFailedTemplate(reference: string): EmailContent {
  return {
    subject: "Il pagamento MIRAI non e andato a buon fine",
    html: layout(
      "Il pagamento non e stato completato.",
      "Pagamento non completato",
      `<p style="margin:0 0 24px;color:#c9c2d2;line-height:1.7">Non siamo riusciti a completare il pagamento. Nessun ordine pagato e stato confermato. Puoi tornare al checkout e riprovare con lo stesso metodo o sceglierne un altro.</p><div>${button("Torna al checkout", `${SITE_URL}/checkout`)}</div><p style="margin:22px 0 0;color:#82788f;font-size:12px">Riferimento: ${escapeHtml(reference)}</p>`,
    ),
    text: `Il pagamento MIRAI non e andato a buon fine. Torna al checkout per riprovare: ${SITE_URL}/checkout\nRiferimento: ${reference}`,
  }
}

export function orderStatusTemplate(order: EmailOrder, status: string): EmailContent {
  const label = STATUS_LABELS[status] || status
  const messages: Record<string, string> = {
    confirmed: "Il tuo ordine e stato confermato.",
    processing: "Il tuo ordine e in preparazione nel nostro store.",
    shipped: "Il tuo ordine e stato affidato al corriere.",
    delivered: "Il tuo ordine risulta consegnato. Grazie per aver scelto MIRAI.",
    cancelled: "Il tuo ordine e stato annullato. Per qualsiasi dubbio, rispondi a questa email.",
  }
  const message = messages[status] || `Lo stato del tuo ordine e cambiato: ${label}.`

  return {
    subject: `Ordine MIRAI #${orderNumber(order.id)}: ${label}`,
    html: layout(
      `Il tuo ordine ora e ${label}.`,
      `Ordine ${label}`,
      `<p style="margin:0 0 24px;color:#c9c2d2;line-height:1.7">${escapeHtml(message)}</p>${orderSummary(order)}<div style="margin-top:26px">${button("Vedi i tuoi ordini", `${SITE_URL}/account`)}</div>`,
    ),
    text: `${message}\n\n${orderText(order)}\n\nAssistenza: info@mirailabstore.com`,
  }
}

export function abandonedCartTemplate(
  items: AbandonedCartItem[],
  unsubscribeUrl: string,
): EmailContent {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const rows = orderRows(items)
  return {
    subject: "Il tuo carrello MIRAI ti aspetta",
    html: layout(
      "Hai lasciato alcuni articoli nel carrello.",
      "Il tuo carrello e ancora qui",
      `<p style="margin:0 0 22px;color:#c9c2d2;line-height:1.7">Hai lasciato questi articoli nel carrello. Le disponibilita possono cambiare, ma puoi riprendere l'acquisto in pochi istanti.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}<tr><td style="padding:17px 0;font-weight:700">Totale carrello</td><td align="right" style="padding:17px 0;font-weight:700;color:#c4b5fd">${escapeHtml(money(total))}</td></tr></table><div style="margin-top:26px">${button("Riprendi il checkout", `${SITE_URL}/checkout`)}</div>`,
      `Ricevi questa email perche hai accettato i promemoria MIRAI. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#c4b5fd">Disiscriviti</a>.<br>MIRAI LAB STORE, Via Umberto 95, 95129 Catania.`,
    ),
    text: `Il tuo carrello MIRAI ti aspetta.\nRiprendi il checkout: ${SITE_URL}/checkout\n\nPer non ricevere altri promemoria: ${unsubscribeUrl}`,
  }
}
