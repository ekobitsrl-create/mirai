"use client"

import { useState } from "react"
import { updateOrderStatus, deleteOrder } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"

type OrderItem = {
  id: string
  product_name: string
  product_image: string | null
  size: string | null
  quantity: number
  price: number
}

type Order = {
  id: string
  email: string
  status: string
  total: number
  shipping_name: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_zip: string | null
  shipping_country: string | null
  stripe_session_id: string | null
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

const STATUS_OPTIONS = [
  { value: "pending", label: "In Attesa", icon: Clock, color: "text-yellow-500" },
  { value: "confirmed", label: "Confermato", icon: CheckCircle, color: "text-blue-500" },
  { value: "processing", label: "In Lavorazione", icon: Loader2, color: "text-orange-500" },
  { value: "shipped", label: "Spedito", icon: Truck, color: "text-purple-500" },
  { value: "delivered", label: "Consegnato", icon: CheckCircle, color: "text-green-500" },
  { value: "cancelled", label: "Annullato", icon: XCircle, color: "text-red-500" },
]

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("id", orderId)
      fd.set("status", newStatus)
      await updateOrderStatus(fd)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo ordine?")) return
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("id", orderId)
      await deleteOrder(fd)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusInfo = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]

  if (orders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 bg-card text-center">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nessun ordine ricevuto</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status)
        const StatusIcon = statusInfo.icon
        const isExpanded = expandedId === order.id

        return (
          <div key={order.id} className="border border-border rounded-lg bg-card overflow-hidden">
            <div
              className="p-6 flex items-center gap-6 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 ${statusInfo.color}`}>
                <StatusIcon className="w-5 h-5" />
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-foreground text-sm font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusInfo.color} border-current/20 bg-current/5`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{order.email}</span>
                  <span>{new Date(order.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Total */}
              <div className="text-right flex-shrink-0">
                <span className="font-mono font-semibold text-foreground">
                  {"\u20AC"}{Number(order.total).toFixed(2)}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {order.order_items?.length || 0} {order.order_items?.length === 1 ? "articolo" : "articoli"}
                </p>
              </div>

              {/* Expand */}
              <div className="flex-shrink-0 text-muted-foreground">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border p-6">
                {/* Shipping info */}
                {order.shipping_name && (
                  <div className="mb-6 p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Spedizione</p>
                    <p className="text-sm text-foreground">{order.shipping_name}</p>
                    {order.shipping_address && <p className="text-sm text-muted-foreground">{order.shipping_address}</p>}
                    {order.shipping_city && (
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_zip} {order.shipping_city}, {order.shipping_country}
                      </p>
                    )}
                  </div>
                )}

                {/* Order items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Articoli</p>
                    <div className="flex flex-col gap-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-secondary flex-shrink-0 overflow-hidden">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size && `Taglia: ${item.size} - `}Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono text-sm text-foreground">
                            {"\u20AC"}{Number(item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="mb-6 p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Note</p>
                    <p className="text-sm text-foreground">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Stato:</p>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(order.id, s.value)}
                      disabled={isSubmitting || order.status === s.value}
                      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                        order.status === s.value
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      onClick={() => handleDelete(order.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Elimina ordine</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
