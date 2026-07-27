"use client"

import { useState } from "react"
import { BadgePercent, Check, Pencil, Plus, Trash2, X } from "lucide-react"
import {
  createDiscountCode,
  deleteDiscountCode,
  updateDiscountCode,
} from "@/app/admin/actions"

type DiscountCode = {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  value: number
  active: boolean
  first_order_only: boolean
  minimum_subtotal: number
  starts_at: string | null
  ends_at: string | null
  max_uses: number | null
  times_used: number
  source?: "database" | "environment"
}

function dateTimeInputValue(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function DiscountForm({
  discount,
  onSubmit,
  onCancel,
}: {
  discount?: DiscountCode
  onSubmit: (formData: FormData) => Promise<void>
  onCancel: () => void
}) {
  return (
    <form action={onSubmit} className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2 xl:grid-cols-4">
      {discount && <input type="hidden" name="id" value={discount.id} />}
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Codice</label>
        <input
          name="code"
          required
          minLength={3}
          maxLength={32}
          defaultValue={discount?.code || ""}
          placeholder="MIRAI10"
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm uppercase tracking-widest text-foreground"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</label>
        <select
          name="discount_type"
          defaultValue={discount?.discount_type || "percentage"}
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        >
          <option value="percentage">Percentuale</option>
          <option value="fixed">Importo fisso</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Valore</label>
        <input
          name="value"
          type="number"
          min="0.01"
          step="0.01"
          required
          defaultValue={discount?.value ?? 10}
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Subtotale minimo (€)</label>
        <input
          name="minimum_subtotal"
          type="number"
          min="0"
          step="0.01"
          defaultValue={discount?.minimum_subtotal ?? 0}
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Inizio</label>
        <input
          name="starts_at"
          type="datetime-local"
          defaultValue={dateTimeInputValue(discount?.starts_at || null)}
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Scadenza</label>
        <input
          name="ends_at"
          type="datetime-local"
          defaultValue={dateTimeInputValue(discount?.ends_at || null)}
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Limite utilizzi</label>
        <input
          name="max_uses"
          type="number"
          min="1"
          step="1"
          defaultValue={discount?.max_uses ?? ""}
          placeholder="Nessun limite"
          className="h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
        />
      </div>
      <div className="flex flex-wrap items-center gap-5 pt-5">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input name="active" type="checkbox" defaultChecked={discount?.active ?? true} className="accent-primary" />
          Attivo
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input
            name="first_order_only"
            type="checkbox"
            defaultChecked={discount?.first_order_only ?? false}
            className="accent-primary"
          />
          Solo primo ordine
        </label>
      </div>
      <div className="flex gap-3 md:col-span-2 xl:col-span-4">
        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground">
          <Check className="h-4 w-4" /> Salva
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2 text-xs uppercase tracking-widest text-muted-foreground">
          <X className="h-4 w-4" /> Annulla
        </button>
      </div>
    </form>
  )
}

export function AdminDiscountCodesTable({
  discountCodes,
  readOnly = false,
}: {
  discountCodes: DiscountCode[]
  readOnly?: boolean
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitCreate = async (formData: FormData) => {
    try {
      setError(null)
      await createDiscountCode(formData)
      setShowCreate(false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossibile creare il codice")
    }
  }

  const submitUpdate = async (formData: FormData) => {
    try {
      setError(null)
      await updateDiscountCode(formData)
      setEditingId(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossibile aggiornare il codice")
    }
  }

  const removeDiscount = async (discount: DiscountCode) => {
    if (!confirm(`Eliminare il codice ${discount.code}?`)) return
    try {
      setError(null)
      const formData = new FormData()
      formData.set("id", discount.id)
      await deleteDiscountCode(formData)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossibile eliminare il codice")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Codici sconto</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gestisci percentuali, importi fissi, scadenze e promozioni primo ordine.</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setShowCreate((visible) => !visible)
              setEditingId(null)
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreate ? "Chiudi" : "Nuovo codice"}
          </button>
        )}
      </div>

      {readOnly && (
        <div className="rounded-md border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
          I codici sono letti dalla variabile server <code className="text-foreground">MIRAI_DISCOUNT_CODES</code>.
          MIRAI10 resta disponibile automaticamente quando la variabile non è impostata.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showCreate && <DiscountForm onSubmit={submitCreate} onCancel={() => setShowCreate(false)} />}

      {discountCodes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-14 text-center">
          <BadgePercent className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">Nessun codice configurato.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discountCodes.map((discount) => (
            <div key={discount.id}>
              {editingId === discount.id ? (
                <DiscountForm
                  discount={discount}
                  onSubmit={submitUpdate}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:flex-row md:items-center">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${discount.active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    <BadgePercent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-base font-bold tracking-widest text-foreground">{discount.code}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${discount.active ? "bg-emerald-400/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                        {discount.active ? "Attivo" : "Disattivato"}
                      </span>
                      {discount.first_order_only && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                          Primo ordine
                        </span>
                      )}
                      {discount.source === "environment" && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          Variabile ambiente
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {discount.discount_type === "percentage"
                        ? `${Number(discount.value).toFixed(0)}% di sconto`
                        : `€${Number(discount.value).toFixed(2)} di sconto`}
                      {Number(discount.minimum_subtotal) > 0 && ` · minimo €${Number(discount.minimum_subtotal).toFixed(2)}`}
                      {` · ${discount.times_used || 0}${discount.max_uses ? `/${discount.max_uses}` : ""} utilizzi`}
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(discount.id)
                          setShowCreate(false)
                        }}
                        aria-label={`Modifica ${discount.code}`}
                        className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDiscount(discount)}
                        aria-label={`Elimina ${discount.code}`}
                        className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
