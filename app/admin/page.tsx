import { redirect } from "next/navigation"
import { getServerUserWithProfile, createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  let userResult
  try {
    userResult = await getServerUserWithProfile()
  } catch {
    redirect("/auth/login?redirectTo=/admin")
  }

  const { user, profile } = userResult

  if (!user) redirect("/auth/login?redirectTo=/admin")
  if (profile?.role !== "admin") redirect("/account")

  const supabase = await createClient()

  const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ])

  const products = productsRes.data || []
  const categories = categoriesRes.data || []
  const orders = ordersRes.data || []
  const users = usersRes.data || []

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders
      .filter((o: any) => o.status === "paid" || o.status === "shipped" || o.status === "delivered")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    pendingOrders: orders.filter((o: any) => o.status === "pending").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Pannello Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestisci prodotti, categorie, ordini e utenti</p>
          </div>
          <a href="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Torna al sito
          </a>
        </div>
        <AdminDashboard
          products={products}
          categories={categories}
          orders={orders}
          users={users}
          stats={stats}
        />
      </div>
    </div>
  )
}
