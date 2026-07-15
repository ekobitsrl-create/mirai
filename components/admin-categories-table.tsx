"use client"

import { useState } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions"
import { Plus, Pencil, Trash2, X, Check, ImageIcon } from "lucide-react"
import Image from "next/image"
import { ImageUpload } from "@/components/image-upload"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

export function AdminCategoriesTable({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(formData: FormData) {
    try {
      setError(null)
      await createCategory(formData)
      setShowForm(false)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleUpdate(formData: FormData) {
    try {
      setError(null)
      await updateCategory(formData)
      setEditingId(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa categoria? I prodotti associati non verranno eliminati.")) return
    try {
      setError(null)
      const fd = new FormData()
      fd.set("id", id)
      await deleteCategory(fd)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Gestione Categorie</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuova Categoria
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* New category form */}
      {showForm && (
        <form action={handleCreate} className="mb-8 p-6 border border-border rounded-lg bg-card">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">Nuova Categoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Nome *</label>
              <input name="name" required className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Slug</label>
              <input name="slug" placeholder="auto-generato dal nome" className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground text-sm placeholder:text-muted-foreground" />
            </div>
            <div>
              <ImageUpload name="image_url" label="Immagine" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Ordine</label>
              <input name="sort_order" type="number" defaultValue={0} className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Descrizione</label>
              <textarea name="description" rows={2} className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground text-sm resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-md hover:bg-primary/90 transition-colors">
              Salva
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-border text-muted-foreground text-xs uppercase tracking-widest rounded-md hover:text-foreground transition-colors">
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* Categories table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium w-14">Img</th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium">Nome</th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Slug</th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium hidden lg:table-cell">Descrizione</th>
              <th className="text-center text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium">Ordine</th>
              <th className="text-right text-xs uppercase tracking-widest text-muted-foreground px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  Nessuna categoria. Creane una nuova.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                {editingId === cat.id ? (
                  <EditRow category={cat} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
                ) : (
                  <>
                    <td className="px-4 py-3">
                      {cat.image_url ? (
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-secondary">
                          <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground line-clamp-1">{cat.description || "---"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-foreground">{cat.sort_order}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingId(cat.id)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Modifica">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" aria-label="Elimina">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EditRow({ category, onSave, onCancel }: { category: any; onSave: (fd: FormData) => void; onCancel: () => void }) {
  return (
    <td colSpan={6} className="px-4 py-3">
      <form action={onSave} className="space-y-3">
        <input type="hidden" name="id" value={category.id} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-muted-foreground mb-1">Nome</label>
            <input name="name" defaultValue={category.name} required className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm text-foreground" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-muted-foreground mb-1">Slug</label>
            <input name="slug" defaultValue={category.slug} className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm text-foreground" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-muted-foreground mb-1">Descrizione</label>
            <input name="description" defaultValue={category.description || ""} className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm text-foreground" />
          </div>
          <div className="w-20">
            <label className="block text-xs text-muted-foreground mb-1">Ordine</label>
            <input name="sort_order" type="number" defaultValue={category.sort_order} className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm text-foreground" />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <ImageUpload name="image_url" defaultValue={category.image_url} label="Immagine" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="px-4 py-1.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-md hover:bg-primary/90 transition-colors">
            Salva
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-1.5 border border-border text-muted-foreground text-xs uppercase tracking-widest rounded-md hover:text-foreground transition-colors">
            Annulla
          </button>
        </div>
      </form>
    </td>
  )
}
