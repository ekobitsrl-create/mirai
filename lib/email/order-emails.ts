import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmailSafely } from "@/lib/email/resend"
import {
  adminOrderNotificationTemplate,
  cashOnDeliveryTemplate,
  orderStatusTemplate,
  paidOrderTemplate,
  paymentFailedTemplate,
  type EmailOrder,
} from "@/lib/email/templates"

const ADMIN_ORDER_NOTIFICATION_EMAIL =
  process.env.ORDER_NOTIFICATION_EMAIL?.trim() || "miralabstore@gmail.com"

type OrderRow = {
  id: string
  email: string
  status: string
  total: number
  shipping_name: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_zip: string | null
  shipping_country: string | null
  order_items: Array<{
    product_name: string
    product_image: string | null
    size: string | null
    quantity: number
    price: number
  }>
}

async function loadOrder(orderId: string): Promise<EmailOrder | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, email, status, total,
      shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country,
      order_items(product_name, product_image, size, quantity, price)
    `)
    .eq("id", orderId)
    .single()

  if (error || !data) {
    console.error("Impossibile caricare l ordine per l email", error)
    return null
  }

  const order = data as unknown as OrderRow
  return {
    id: order.id,
    email: order.email,
    status: order.status,
    total: Number(order.total),
    shippingName: order.shipping_name,
    shippingAddress: order.shipping_address,
    shippingCity: order.shipping_city,
    shippingZip: order.shipping_zip,
    shippingCountry: order.shipping_country,
    items: (order.order_items || []).map((item) => ({
      name: item.product_name,
      image: item.product_image,
      size: item.size,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
  }
}

export async function sendOrderConfirmationEmail(
  orderId: string,
  paymentMethod: "stripe" | "cash_on_delivery",
) {
  const order = await loadOrder(orderId)
  if (!order) return

  if (order.email) {
    const content = paymentMethod === "cash_on_delivery"
      ? cashOnDeliveryTemplate(order)
      : paidOrderTemplate(order)

    await sendEmailSafely({
      ...content,
      to: order.email,
      eventKey: `order-confirmation-${paymentMethod}-${order.id}`,
      category: "transactional",
    })
  }

  await sendEmailSafely({
    ...adminOrderNotificationTemplate(order, paymentMethod),
    to: ADMIN_ORDER_NOTIFICATION_EMAIL,
    eventKey: `order-admin-notification-${order.id}`,
    category: "transactional",
  })
}

export async function sendOrderStatusEmail(orderId: string, status: string) {
  const order = await loadOrder(orderId)
  if (!order?.email) return

  await sendEmailSafely({
    ...orderStatusTemplate(order, status),
    to: order.email,
    eventKey: `order-status-${order.id}-${status}`,
    category: "transactional",
  })
}

function paymentIntentReference(
  paymentIntent: string | Stripe.PaymentIntent | null,
  fallback: string,
) {
  if (typeof paymentIntent === "string") return paymentIntent
  return paymentIntent?.id || fallback
}

export async function sendCheckoutPaymentFailedEmail(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email
  if (!email) return

  const reference = paymentIntentReference(session.payment_intent, session.id)
  await sendEmailSafely({
    ...paymentFailedTemplate(reference),
    to: email,
    eventKey: `payment-failed-${reference}`,
    category: "transactional",
  })
}

export async function sendPaymentIntentFailedEmail(paymentIntent: Stripe.PaymentIntent) {
  const email = paymentIntent.receipt_email
  if (!email) return

  await sendEmailSafely({
    ...paymentFailedTemplate(paymentIntent.id),
    to: email,
    eventKey: `payment-failed-${paymentIntent.id}`,
    category: "transactional",
  })
}
