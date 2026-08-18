"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminProductTable } from "@/components/admin-product-table"
import { AdminCategoriesTable } from "@/components/admin-categories-table"
import { AdminOrdersTable } from "@/components/admin-orders-table"
import { AdminUsersTable } from "@/components/admin-users-table"
import { AdminDiscountCodesTable } from "@/components/admin-discount-codes-table"
import { BadgePercent, Package, FolderTree, ShoppingCart, Users } from "lucide-react"

type Props = {
  products: any[]
  categories: any[]
  orders: any[]
  users: any[]
  discountCodes: any[]
  discountCodesReadOnly?: boolean
  cartCounterResetAt: string
  stats: {
    totalProducts: number
    publishedProducts: number
    draftProducts: number
    totalOrders: number
    totalUsers: number
    totalRevenue: number
    pendingOrders: number
    cartsCreated: number
    cartsAbandoned: number
    cookieDeclines: number
  }
}

const TABS = [
  { id: "products", label: "Prodotti", icon: Package },
  { id: "categories", label: "Categorie", icon: FolderTree },
  { id: "orders", label: "Ordini", icon: ShoppingCart },
  { id: "discounts", label: "Sconti", icon: BadgePercent },
  { id: "users", label: "Utenti", icon: Users },
] as const

type TabId = (typeof TABS)[number]["id"]

export function AdminDashboard({
  products,
  categories,
  orders,
  users,
  discountCodes,
  discountCodesReadOnly = false,
  cartCounterResetAt,
  stats,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("products")
  const router = useRouter()

  useEffect(() => {
    const resetAt = new Date(cartCounterResetAt).getTime()
    const delay = Math.max(1_000, resetAt - Date.now() + 1_000)
    const timer = window.setTimeout(() => router.refresh(), delay)

    return () => window.clearTimeout(timer)
  }, [cartCounterResetAt, router])

  return (
    <div className="min-w-0 touch-pan-y">
      <div className="mb-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 xl:mb-10 xl:grid-cols-8">
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Prodotti</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.publishedProducts} pubblicati / {stats.draftProducts} bozze
          </p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Categorie</p>
          <p className="text-3xl font-bold text-foreground">{categories.length}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Ordini</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
          {stats.pendingOrders > 0 && (
            <p className="text-xs text-primary mt-1">{stats.pendingOrders} in attesa</p>
          )}
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Carrelli creati oggi</p>
          <p className="text-3xl font-bold text-foreground">{stats.cartsCreated}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Abbandonati</p>
          <p className="text-3xl font-bold text-foreground">{stats.cartsAbandoned}</p>
          <p className="text-xs text-muted-foreground mt-1">oggi · inattivi da 30 min</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Cookie non accettati</p>
          <p className="text-3xl font-bold text-foreground">{stats.cookieDeclines}</p>
          <p className="text-xs text-muted-foreground mt-1">oggi · solo conteggio</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Utenti</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Fatturato</p>
          <p className="text-3xl font-bold text-foreground">{"\u20AC"}{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="-mx-3 mb-6 flex items-center gap-1 overflow-x-auto border-b border-border px-3 pb-px [scrollbar-width:none] sm:mx-0 sm:mb-8 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest border-b-2 transition-colors -mb-px shrink-0 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "products" && <AdminProductTable products={products} categories={categories} />}
      {activeTab === "categories" && <AdminCategoriesTable categories={categories} />}
      {activeTab === "orders" && <AdminOrdersTable orders={orders} />}
      {activeTab === "discounts" && (
        <AdminDiscountCodesTable discountCodes={discountCodes} readOnly={discountCodesReadOnly} />
      )}
      {activeTab === "users" && <AdminUsersTable users={users} />}
    </div>
  )
}
