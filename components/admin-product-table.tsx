"use client"

import { useState } from "react"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteBlackIslandProducts,
  importMiraiSupplierCatalog,
} from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, X, Check, Package, Download } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  sizes: string[]
  stock_by_size?: Record<string, number>
  in_stock: boolean
  is_new: boolean
  brand?: string | null
  supplier_sku?: string | null
  color_name?: string | null
  color_hex?: string | null
  fit_note?: string | null
  detail_items?: string[] | null
  composition?: string | null
  care?: string | null
  created_at: string
  updated_at: string
}

type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

export function AdminProductTable({ products, categories = [] }: { products: Product[]; categories?: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const blackIslandCount = products.filter((product) => /black[\s_-]*island/i.test(`${product.name || ""} ${product.image_url || ""}`)).length

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await createProduct(formData)
      setShowForm(false)
    } catch (err) {
      console.error(err)
      setFeedback(err instanceof Error ? err.message : "Impossibile creare il prodotto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await updateProduct(formData)
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setFeedback(err instanceof Error ? err.message : "Impossibile aggiornare il prodotto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      await deleteProduct(formData)
    } catch (err) {
      console.error(err)
      setFeedback(err instanceof Error ? err.message : "Impossibile eliminare il prodotto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBlackIslandCleanup = async () => {
    if (!confirm(`Eliminare definitivamente ${blackIslandCount} prodotti Black Island da Supabase?`)) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const result = await deleteBlackIslandProducts()
      setFeedback(`${result.deleted} prodotti Black Island eliminati definitivamente.`)
    } catch (err) {
      console.error(err)
      setFeedback(err instanceof Error ? err.message : "Pulizia Black Island non riuscita.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMiraiCatalogImport = async () => {
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const result = await importMiraiSupplierCatalog()
      const categoryMessage = result.categoryCreated ? " Categoria Canotte creata." : ""
      setFeedback(
        `${result.inserted} prodotti MIRAI importati, ${result.skipped} già presenti.${categoryMessage} `
        + "Taglie e quantità restano da confermare: i nuovi prodotti non sono acquistabili finché non imposti lo stock.",
      )
    } catch (err) {
      console.error(err)
      setFeedback(err instanceof Error ? err.message : "Importazione catalogo MIRAI non riuscita.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Add product button */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => { setShowForm(!showForm); setEditingId(null) }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs h-10 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuovo Prodotto
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleMiraiCatalogImport}
          className="h-10 gap-2 border-primary/40 text-xs uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Download className="h-4 w-4" />
          {isSubmitting ? "Importazione..." : "Importa catalogo MIRAI (26)"}
        </Button>
        {blackIslandCount > 0 && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleBlackIslandCleanup}
            className="h-10 gap-2 border-destructive/40 text-xs uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Elimina {blackIslandCount} Black Island
          </Button>
        )}
      </div>

      {feedback && (
        <div className="mb-6 rounded-md border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="border border-border rounded-lg p-6 bg-card mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Nuovo Prodotto</h2>
          <form action={handleCreate}>
            <ProductForm categories={categories} />
            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs h-10 gap-2"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? "Salvataggio..." : "Salva"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="uppercase tracking-widest text-xs h-10 gap-2"
              >
                <X className="w-4 h-4" />
                Annulla
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <div className="border border-border rounded-lg p-12 bg-card text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nessun prodotto nel catalogo</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <div key={product.id} className="border border-border rounded-lg bg-card overflow-hidden">
              {editingId === product.id ? (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">
                    Modifica Prodotto
                  </h2>
                  <form action={handleUpdate}>
                    <input type="hidden" name="id" value={product.id} />
                    <ProductForm product={product} categories={categories} />
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs h-10 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {isSubmitting ? "Salvataggio..." : "Aggiorna"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="uppercase tracking-widest text-xs h-10 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Annulla
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded bg-secondary flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      {product.is_new && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          Nuovo
                        </span>
                      )}
                      {!product.in_stock && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                          Esaurito
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {product.description || "Nessuna descrizione"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono text-foreground">
                        {"\u20AC"}{Number(product.price).toFixed(2)}
                      </span>
                      <span className="uppercase tracking-widest">{product.category}</span>
                      <span>{product.sizes?.join(", ") || "N/A"}</span>
                      {product.stock_by_size && (
                        <span>
                          {Object.values(product.stock_by_size).reduce((total, quantity) => total + Number(quantity || 0), 0)} pezzi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => { setEditingId(product.id); setShowForm(false) }}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Elimina</span>
                      </Button>
                    </form>
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

function ProductForm({ product, categories = [] }: { product?: Product; categories?: Category[] }) {
  const [sizeInput, setSizeInput] = useState(product?.sizes?.join(", ") || "")
  const [stockBySize, setStockBySize] = useState<Record<string, number>>(product?.stock_by_size || {})
  const parsedSizes = [...new Set(
    sizeInput
      .split(",")
      .map((size) => size.trim().toUpperCase())
      .filter(Boolean),
  )]
  const normalizedStock = Object.fromEntries(
    parsedSizes.map((size) => [size, Math.max(0, Math.floor(Number(stockBySize[size] ?? 1)))]),
  )

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
          Nome
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
          placeholder="Nome prodotto"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="price" className="text-xs uppercase tracking-widest text-muted-foreground">
          Prezzo
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={product?.price || ""}
          placeholder="0.00"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="category" className="text-xs uppercase tracking-widest text-muted-foreground">
          Categoria
        </Label>
        <select
          id="category"
          name="category"
          required
          defaultValue={product?.category || ""}
          className="w-full h-10 px-3 bg-secondary border border-border rounded-md text-foreground text-sm"
        >
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
      <div className="flex flex-col gap-2">
        <ImageUpload
          name="image_url"
          defaultValue={product?.image_url}
          label="Immagine Prodotto"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sizes" className="text-xs uppercase tracking-widest text-muted-foreground">
          Taglie (separate da virgola)
        </Label>
        <Input
          id="sizes"
          name="sizes"
          value={sizeInput}
          onChange={(event) => setSizeInput(event.target.value)}
          placeholder="S, M, L, XL"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex items-end gap-6 pb-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="in_stock"
            defaultChecked={product?.in_stock ?? true}
            className="rounded border-border"
          />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Disponibile</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_new"
            defaultChecked={product?.is_new ?? false}
            className="rounded border-border"
          />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Nuovo</span>
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="brand" className="text-xs uppercase tracking-widest text-muted-foreground">
          Brand
        </Label>
        <Input
          id="brand"
          name="brand"
          defaultValue={product?.brand || "MIRAI"}
          placeholder="MIRAI"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="supplier_sku" className="text-xs uppercase tracking-widest text-muted-foreground">
          SKU fornitore
        </Label>
        <Input
          id="supplier_sku"
          name="supplier_sku"
          defaultValue={product?.supplier_sku || ""}
          placeholder="MIRAI-..."
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="color_name" className="text-xs uppercase tracking-widest text-muted-foreground">
          Colore
        </Label>
        <Input
          id="color_name"
          name="color_name"
          defaultValue={product?.color_name || ""}
          placeholder="Nero"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="color_hex" className="text-xs uppercase tracking-widest text-muted-foreground">
          Colore HEX
        </Label>
        <Input
          id="color_hex"
          name="color_hex"
          defaultValue={product?.color_hex || ""}
          placeholder="#000000"
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <input type="hidden" name="stock_by_size" value={JSON.stringify(normalizedStock)} />
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          Quantita disponibile per taglia
        </Label>
        {parsedSizes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {parsedSizes.map((size) => (
              <label key={size} className="rounded-md border border-border bg-secondary/50 p-3">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-foreground">
                  {size}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={normalizedStock[size]}
                  onChange={(event) => {
                    const quantity = Math.max(0, Math.floor(Number(event.target.value || 0)))
                    setStockBySize((current) => ({ ...current, [size]: quantity }))
                  }}
                  aria-label={`Quantita taglia ${size}`}
                  className="bg-background border-border text-foreground"
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Inserisci prima le taglie, separate da una virgola.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground">
          Descrizione
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description || ""}
          placeholder="Descrizione del prodotto..."
          className="bg-secondary border-border text-foreground resize-none"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="fit_note" className="text-xs uppercase tracking-widest text-muted-foreground">
          Nota vestibilità
        </Label>
        <Input
          id="fit_note"
          name="fit_note"
          defaultValue={product?.fit_note || ""}
          placeholder="Vestibilità oversize..."
          className="bg-secondary border-border text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="detail_items" className="text-xs uppercase tracking-widest text-muted-foreground">
          Scheda tecnica (una voce per riga)
        </Label>
        <Textarea
          id="detail_items"
          name="detail_items"
          rows={5}
          defaultValue={product?.detail_items?.join("\n") || ""}
          placeholder={"Maxi grafica frontale\nGirocollo e manica corta\nDestinazione: Unisex"}
          className="bg-secondary border-border text-foreground resize-y"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="composition" className="text-xs uppercase tracking-widest text-muted-foreground">
          Composizione
        </Label>
        <Textarea
          id="composition"
          name="composition"
          rows={3}
          defaultValue={product?.composition || ""}
          placeholder="Da confermare con il fornitore"
          className="bg-secondary border-border text-foreground resize-y"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="care" className="text-xs uppercase tracking-widest text-muted-foreground">
          Cura del capo
        </Label>
        <Textarea
          id="care"
          name="care"
          rows={3}
          defaultValue={product?.care || ""}
          placeholder="Da confermare con il fornitore"
          className="bg-secondary border-border text-foreground resize-y"
        />
      </div>
    </div>
  )
}
