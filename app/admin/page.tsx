import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"
import { getServerUserWithProfile, createClient, createUserClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getEnvironmentDiscountCodes } from "@/lib/discounts"
import { getDailyTimeWindow } from "@/lib/daily-time-window"

export default async function AdminPage() {
  let userResult
  try {
    userResult = await getServerUserWithProfile()
  } catch {
    redirect("/auth/login?redirectTo=/admin")
  }

  const { user, profile } = userResult

  if (!user) redirect("/auth/login?redirectTo=/admin")
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) redirect("/account")

  const supabase = await createUserClient()
  if (!supabase) redirect("/auth/login?redirectTo=/admin")
  const adminSupabase = await createClient()

  const abandonedBefore = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const cartCounterWindow = getDailyTimeWindow(new Date(), "Europe/Rome")
  const cartsCreatedAfter = cartCounterWindow.start.toISOString()

  const [
    productsRes,
    categoriesRes,
    ordersRes,
    usersRes,
    discountCodesRes,
    cartsCreatedRes,
    cartsAbandonedRes,
    cookieDeclinesRes,
  ] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    adminSupabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
    adminSupabase
      .from("cart_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cartsCreatedAfter)
      .neq("status", "cleared"),
    adminSupabase
      .from("cart_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cartsCreatedAfter)
      .eq("status", "active")
      .lt("updated_at", abandonedBefore),
    adminSupabase
      .from("cookie_consent_daily_counts")
      .select("necessary_only_count")
      .eq("day", cartCounterWindow.dateKey)
      .maybeSingle(),
  ])

  const products = productsRes.data || []
  const categories = categoriesRes.data || []
  const orders = ordersRes.data || []
  const users = usersRes.data || []
  const discountCodesReadOnly = Boolean(discountCodesRes.error)
  const discountCodes = discountCodesReadOnly
    ? getEnvironmentDiscountCodes().map((discount) => ({
        ...discount,
        id: `env:${discount.code}`,
        source: "environment",
      }))
    : discountCodesRes.data || []

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders
      .filter((o: any) => o.status === "paid" || o.status === "shipped" || o.status === "delivered")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    pendingOrders: orders.filter((o: any) => o.status === "pending").length,
    cartsCreated: cartsCreatedRes.count || 0,
    cartsAbandoned: cartsAbandonedRes.count || 0,
    cookieDeclines: Number(cookieDeclinesRes.data?.necessary_only_count) || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Pannello Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestisci prodotti, categorie, ordini e utenti</p>
          </div>
          <div className="flex items-center gap-5">
            <a href="/community/hub" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Community
            </a>
            <a href="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Torna al sito
            </a>
          </div>
        </div>
        <AdminDashboard
          products={products}
          categories={categories}
          orders={orders}
          users={users}
          discountCodes={discountCodes}
          discountCodesReadOnly={discountCodesReadOnly}
          stats={stats}
          cartCounterResetAt={cartCounterWindow.end.toISOString()}
        />
      </div>
    </div>
  )
}
