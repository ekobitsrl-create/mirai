"use client"

import { useState } from "react"
import { AdminProductTable } from "@/components/admin-product-table"
import { AdminCategoriesTable } from "@/components/admin-categories-table"
import { AdminOrdersTable } from "@/components/admin-orders-table"
import { AdminUsersTable } from "@/components/admin-users-table"
import { Package, FolderTree, ShoppingCart, Users } from "lucide-react"

type Props = {
  products: any[]
  categories: any[]
  orders: any[]
  users: any[]
  stats: {
    totalProducts: number
    totalOrders: number
    totalUsers: number
    totalRevenue: number
    pendingOrders: number
  }
}

const TABS = [
  { id: "products", label: "Prodotti", icon: Package },
  { id: "categories", label: "Categorie", icon: FolderTree },
  { id: "orders", label: "Ordini", icon: ShoppingCart },
  { id: "users", label: "Utenti", icon: Users },
] as const

type TabId = (typeof TABS)[number]["id"]

export function AdminDashboard({ products, categories, orders, users, stats }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("products")

  return (
    <div>
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Prodotti</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Categorie</p>
          <p className="text-3xl font-bold text-foreground">{categories.length}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Ordini</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
          {stats.pendingOrders > 0 && (
            <p className="text-xs text-primary mt-1">{stats.pendingOrders} in attesa</p>
          )}
        </div>
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Utenti</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
        </div>
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Fatturato</p>
          <p className="text-3xl font-bold text-foreground">
            {"\u20AC"}{stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
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

      {/* Tab content */}
      {activeTab === "products" && <AdminProductTable products={products} categories={categories} />}
      {activeTab === "categories" && <AdminCategoriesTable categories={categories} />}
      {activeTab === "orders" && <AdminOrdersTable orders={orders} />}
      {activeTab === "users" && <AdminUsersTable users={users} />}
    </div>
  )
}
