"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Shield, Package, Tag, ShoppingBag, Users,
  Plus, Pencil, Trash2, X, Check, LogOut, ChevronDown
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

type Tab = "products" | "categories" | "orders" | "users"

const supabase = createClient()

export function AdminPanel() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("products")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false)

  async function fetchData() {
    try {
      setLoading(true)
      const [p, c, o, u] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ])
      setProducts(p.data || [])
      setCategories(c.data || [])
      setOrders(o.data || [])
      setUsers(u.data || [])
    } catch (err) {
      // error fetching data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/clear-session', { method: 'POST' }).catch(() => {})
    window.location.href = "/"
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum: number, o) => sum + Number(o.total || 0), 0),
  }

  const tabs: { id: Tab; label: string; icon: typeof Package; count: number }[] = [
    { id: "products", label: "Prodotti", icon: Package, count: stats.totalProducts },
    { id: "categories", label: "Categorie", icon: Tag, count: categories.length },
    { id: "orders", label: "Ordini", icon: ShoppingBag, count: stats.totalOrders },
    { id: "users", label: "Utenti", icon: Users, count: stats.totalUsers },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold tracking-[0.25em] uppercase text-foreground">
              {"MIR\u039BI"}
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Account
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs uppercase tracking-widest gap-2">
              <LogOut className="w-3.5 h-3.5" /> Esci
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Pannello di Controllo</h1>
          <p className="text-sm text-muted-foreground">Gestisci il tuo negozio MIRAI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Prodotti", value: stats.totalProducts, color: "text-blue-400" },
            { label: "Categorie", value: categories.length, color: "text-emerald-400" },
            { label: "Ordini", value: stats.totalOrders, color: "text-amber-400" },
            { label: "Fatturato", value: `${stats.totalRevenue.toFixed(2)} EUR`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary/20" : "bg-muted"}`}>
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === "products" && <ProductsTab products={products} categories={categories} onRefresh={fetchData} />}
            {tab === "categories" && <CategoriesTab categories={categories} onRefresh={fetchData} />}
            {tab === "orders" && <OrdersTab orders={orders} onRefresh={fetchData} />}
            {tab === "users" && <UsersTab users={users} onRefresh={fetchData} />}
          </>
        )}
      </div>
    </div>
  )
}

/* ========== PRODUCTS TAB ========== */
function ProductsTab({ products, categories, onRefresh }: { products: any[]; categories: any[]; onRefresh: () => void }) {
  // uses module-level supabase singleton
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id?: string) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get("name") as string,
      price: parseFloat(fd.get("price") as string),
      category: fd.get("category") as string,
      image_url: fd.get("image_url") as string || null,
      sizes: (fd.get("sizes") as string)?.split(",").map(s => s.trim()).filter(Boolean) || [],
      description: fd.get("description") as string || null,
      in_stock: fd.get("in_stock") === "on",
      is_new: fd.get("is_new") === "on",
    }

    if (id) {
      await supabase.from("products").update(data).eq("id", id)
    } else {
      await supabase.from("products").insert(data)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    onRefresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo prodotto?")) return
    await supabase.from("products").delete().eq("id", id)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Catalogo Prodotti</h2>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null) }} className="gap-2 text-xs uppercase tracking-widest">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Annulla" : "Nuovo Prodotto"}
        </Button>
      </div>

      {/* New Product Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">Nuovo Prodotto</h3>
          <ProductForm categories={categories} onSubmit={(e) => handleSave(e)} saving={saving} />
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nessun prodotto nel catalogo</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-4">
              {editId === p.id ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">Modifica Prodotto</h3>
                  <ProductForm product={p} categories={categories} onSubmit={(e) => handleSave(e, p.id)} saving={saving} />
                  <Button variant="ghost" size="sm" onClick={() => setEditId(null)} className="mt-3 text-xs">Annulla</Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-14 h-14 object-cover rounded-md bg-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{p.name}</h3>
                      {p.is_new && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-primary/20 text-primary rounded">Nuovo</span>}
                      {!p.in_stock && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">Esaurito</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{Number(p.price).toFixed(2)} EUR</span>
                      <span>{p.category}</span>
                      {p.sizes?.length > 0 && <span>{p.sizes.join(", ")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(p.id)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductForm({ product, categories, onSubmit, saving }: {
  product?: any; categories: any[]; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; saving: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome</Label>
        <Input name="name" required defaultValue={product?.name || ""} placeholder="Nome prodotto" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Prezzo</Label>
        <Input name="price" type="number" step="0.01" min="0" required defaultValue={product?.price || ""} placeholder="0.00" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Categoria</Label>
        <select name="category" required defaultValue={product?.category || ""} className="h-10 px-3 bg-secondary border border-border rounded-md text-foreground text-sm">
          <option value="" disabled>Seleziona categoria</option>
          {categories.filter((c: any) => !c.parent_id).map((parent: any) => {
            const children = categories.filter((c: any) => c.parent_id === parent.id)
            if (children.length === 0) return <option key={parent.id} value={parent.slug}>{parent.name}</option>
            return (
              <optgroup key={parent.id} label={parent.name}>
                {children.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </optgroup>
            )
          })}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <ImageUpload name="image_url" defaultValue={product?.image_url} label="Immagine Prodotto" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Taglie (separate da virgola)</Label>
        <Input name="sizes" defaultValue={product?.sizes?.join(", ") || ""} placeholder="S, M, L, XL" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Descrizione</Label>
        <Input name="description" defaultValue={product?.description || ""} placeholder="Descrizione breve" className="bg-secondary" />
      </div>
      <div className="flex items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" name="in_stock" defaultChecked={product?.in_stock !== false} className="rounded" />
          Disponibile
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" name="is_new" defaultChecked={product?.is_new || false} className="rounded" />
          Nuovo arrivo
        </label>
      </div>
      <div className="md:col-span-2">
        <Button type="submit" size="sm" disabled={saving} className="gap-2 text-xs uppercase tracking-widest">
          <Check className="w-3.5 h-3.5" /> {saving ? "Salvataggio..." : product ? "Aggiorna" : "Crea Prodotto"}
        </Button>
      </div>
    </form>
  )
}

/* ========== CATEGORIES TAB ========== */
function CategoriesTab({ categories, onRefresh }: { categories: any[]; onRefresh: () => void }) {
  // uses module-level supabase singleton
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id?: string) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string
    const parentId = fd.get("parent_id") as string
    const data = {
      name,
      slug: (fd.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: fd.get("description") as string || null,
      image_url: fd.get("image_url") as string || null,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
      parent_id: parentId || null,
    }

    let result
    if (id) {
      result = await supabase.from("categories").update(data).eq("id", id)
    } else {
      result = await supabase.from("categories").insert(data)
    }

    if (result.error) {
      alert("Errore: " + result.error.message)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    onRefresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa categoria?")) return
    const result = await supabase.from("categories").delete().eq("id", id)

    if (result.error) {
      alert("Errore: " + result.error.message)
    }
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Gestione Categorie</h2>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null) }} className="gap-2 text-xs uppercase tracking-widest">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Annulla" : "Nuova Categoria"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">Nuova Categoria</h3>
          <CategoryForm categories={categories} onSubmit={(e) => handleSave(e)} saving={saving} />
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nessuna categoria</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {categories.filter((c: any) => !c.parent_id).map((parent: any) => {
            const children = categories.filter((c: any) => c.parent_id === parent.id)
            return (
              <div key={parent.id}>
                <div className="bg-card border border-border rounded-lg p-4">
                  {editId === parent.id ? (
                    <div>
                      <CategoryForm category={parent} categories={categories} onSubmit={(e) => handleSave(e, parent.id)} saving={saving} />
                      <Button variant="ghost" size="sm" onClick={() => setEditId(null)} className="mt-3 text-xs">Annulla</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{parent.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>/{parent.slug}</span>
                          {parent.description && <span className="truncate max-w-[200px]">{parent.description}</span>}
                          <span className="text-primary">{children.length} sottocategorie</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(parent.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(parent.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {children.length > 0 && (
                  <div className="ml-6 mt-1 grid gap-1">
                    {children.map((c: any) => (
                      <div key={c.id} className="bg-card/50 border border-border/50 rounded-md p-3">
                        {editId === c.id ? (
                          <div>
                            <CategoryForm category={c} categories={categories} onSubmit={(e) => handleSave(e, c.id)} saving={saving} />
                            <Button variant="ghost" size="sm" onClick={() => setEditId(null)} className="mt-3 text-xs">Annulla</Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-foreground text-sm">{c.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>/{c.slug}</span>
                                {c.description && <span className="truncate max-w-[200px]">{c.description}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditId(c.id)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CategoryForm({ category, categories = [], onSubmit, saving }: {
  category?: any; categories?: any[]; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; saving: boolean
}) {
  const parentOptions = categories.filter((c: any) => !c.parent_id && c.id !== category?.id)
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome</Label>
        <Input name="name" required defaultValue={category?.name || ""} placeholder="Nome categoria" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Slug</Label>
        <Input name="slug" defaultValue={category?.slug || ""} placeholder="auto-generato dal nome" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Categoria Padre</Label>
        <select name="parent_id" defaultValue={category?.parent_id || ""} className="h-10 px-3 bg-secondary border border-border rounded-md text-foreground text-sm">
          <option value="">Nessuna (categoria principale)</option>
          {parentOptions.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Descrizione</Label>
        <Input name="description" defaultValue={category?.description || ""} placeholder="Descrizione opzionale" className="bg-secondary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <ImageUpload name="image_url" defaultValue={category?.image_url} label="Immagine Categoria" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Ordine</Label>
        <Input name="sort_order" type="number" defaultValue={category?.sort_order || 0} className="bg-secondary" />
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" size="sm" disabled={saving} className="gap-2 text-xs uppercase tracking-widest">
          <Check className="w-3.5 h-3.5" /> {saving ? "Salvataggio..." : category ? "Aggiorna" : "Crea Categoria"}
        </Button>
      </div>
    </form>
  )
}

/* ========== ORDERS TAB ========== */
function OrdersTab({ orders, onRefresh }: { orders: any[]; onRefresh: () => void }) {
  // uses module-level supabase singleton

  const statusLabels: Record<string, string> = {
    pending: "In attesa",
    confirmed: "Confermato",
    processing: "In lavorazione",
    shipped: "Spedito",
    delivered: "Consegnato",
    cancelled: "Annullato",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    processing: "bg-purple-500/20 text-purple-400",
    shipped: "bg-cyan-500/20 text-cyan-400",
    delivered: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-red-500/20 text-red-400",
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    onRefresh()
  }

  async function deleteOrder(id: string) {
    if (!confirm("Eliminare questo ordine?")) return
    await supabase.from("orders").delete().eq("id", id)
    onRefresh()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-6">Gestione Ordini</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nessun ordine ricevuto</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-foreground text-sm font-mono">#{o.id.slice(0, 8)}</h3>
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[o.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.email} - {new Date(o.created_at).toLocaleDateString("it-IT")}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{Number(o.total).toFixed(2)} EUR</p>
                </div>
              </div>

              {/* Shipping info */}
              {o.shipping_name && (
                <div className="text-xs text-muted-foreground mb-3 bg-secondary/50 rounded-md p-2">
                  <span className="font-medium text-foreground">{o.shipping_name}</span>
                  {o.shipping_address && <> - {o.shipping_address}</>}
                  {o.shipping_city && <>, {o.shipping_city}</>}
                  {o.shipping_zip && <> {o.shipping_zip}</>}
                </div>
              )}

              {/* Order items */}
              {o.order_items?.length > 0 && (
                <div className="mb-3">
                  {o.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                      <span className="text-foreground">{item.product_name} {item.size && `(${item.size})`} x{item.quantity}</span>
                      <span className="text-muted-foreground">{Number(item.price).toFixed(2)} EUR</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="h-8 px-2 bg-secondary border border-border rounded text-xs text-foreground"
                >
                  {Object.entries(statusLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteOrder(o.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ========== USERS TAB ========== */
function UsersTab({ users, onRefresh }: { users: any[]; onRefresh: () => void }) {
  // uses module-level supabase singleton

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    if (newRole === "admin" && !confirm("Promuovere questo utente ad admin?")) return
    await supabase.from("profiles").update({ role: newRole }).eq("id", id)
    onRefresh()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-6">Utenti Registrati</h2>

      {users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nessun utente registrato</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold uppercase">
                {(u.first_name?.[0] || u.id[0])}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm">
                  {u.first_name || u.last_name ? `${u.first_name || ""} ${u.last_name || ""}`.trim() : "Utente senza nome"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono truncate">{u.id.slice(0, 12)}...</span>
                  <span>Registrato: {new Date(u.created_at).toLocaleDateString("it-IT")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {u.role || "user"}
                </span>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest h-7" onClick={() => toggleRole(u.id, u.role || "user")}>
                  {u.role === "admin" ? "Rimuovi Admin" : "Promuovi Admin"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
