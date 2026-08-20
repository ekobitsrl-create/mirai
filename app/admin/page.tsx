import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"
import { getServerUserWithProfile, createAdminClient } from "@/lib/supabase/server"
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

  const adminSupabase = createAdminClient()

  const abandonedBefore = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const cartCounterWindow = getDailyTimeWindow(new Date(), "Europe/Rome")
  const cartsCreatedAfter = cartCounterWindow.start.toISOString()

  const [
    productsRes,
    categoriesRes,
    ordersRes,
    usersRes,
    authUsersRes,
    discountCodesRes,
    cartsCreatedRes,
    cartsAbandonedRes,
    cookieDeclinesRes,
  ] = await Promise.all([
    adminSupabase.from("products").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("categories").select("*").order("sort_order", { ascending: true }),
    adminSupabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    adminSupabase.from("profiles").select("*").order("created_at", { ascending: false }),
    adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    adminSupabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
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
  const profiles = usersRes.data || []
  const authMembershipById = new Map(
    (authUsersRes.data?.users || []).map((authUser) => [
      authUser.id,
      authUser.user_metadata?.membership === "mirai-society",
    ]),
  )
  const normalizeEmail = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : ""
  const profileByEmail = new Map(
    profiles
      .map((profile: any) => [normalizeEmail(profile.email), profile] as const)
      .filter(([email]) => Boolean(email)),
  )
  const ordersByUserId = new Map<string, any[]>()
  const ordersByEmail = new Map<string, any[]>()

  for (const order of orders) {
    if (order.user_id) {
      const userOrders = ordersByUserId.get(order.user_id) || []
      userOrders.push(order)
      ordersByUserId.set(order.user_id, userOrders)
    }

    const email = normalizeEmail(order.email)
    if (email) {
      const emailOrders = ordersByEmail.get(email) || []
      emailOrders.push(order)
      ordersByEmail.set(email, emailOrders)
    }
  }

  const registeredUsers = profiles.map((profile: any) => {
    const email = normalizeEmail(profile.email)
    const matchingOrders = new Map<string, any>()

    for (const order of ordersByUserId.get(profile.id) || []) matchingOrders.set(order.id, order)
    for (const order of ordersByEmail.get(email) || []) matchingOrders.set(order.id, order)

    return {
      ...profile,
      is_registered: true,
      is_customer: matchingOrders.size > 0,
      is_community_member: authMembershipById.get(profile.id) === true,
      order_count: matchingOrders.size,
    }
  })

  const guestCustomers = Array.from(ordersByEmail.entries()).flatMap(([email, customerOrders]) => {
    if (profileByEmail.has(email)) return []

    const latestOrder = customerOrders.reduce((latest, order) =>
      new Date(order.created_at).getTime() > new Date(latest.created_at).getTime() ? order : latest,
    )

    return [{
      id: `guest:${email}`,
      first_name: latestOrder.shipping_name || "Cliente ospite",
      last_name: null,
      email,
      role: "guest",
      created_at: latestOrder.created_at,
      is_registered: false,
      is_customer: true,
      is_community_member: false,
      order_count: customerOrders.length,
    }]
  })
  const users = [...registeredUsers, ...guestCustomers]
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
    publishedProducts: products.filter((product: any) => product.is_published !== false).length,
    draftProducts: products.filter((product: any) => product.is_published === false).length,
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
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Pannello Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestisci prodotti, categorie, ordini e utenti</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
