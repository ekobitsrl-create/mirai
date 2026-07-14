"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  name: string
  defaultValue?: string | null
  label?: string
  className?: string
}

export function ImageUpload({ name, defaultValue, label = "Immagine", className = "" }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue || "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload fallito")
        return
      }

      setImageUrl(data.url)
    } catch {
      setError("Errore di connessione durante l'upload")
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleRemove() {
    setImageUrl("")
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>

      {/* Hidden input to pass value in FormData */}
      <input type="hidden" name={name} value={imageUrl} />

      {imageUrl ? (
        /* Preview */
        <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary">
          <div className="relative aspect-video w-full max-w-[240px]">
            <Image
              src={imageUrl}
              alt="Anteprima"
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Rimuovi immagine"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Upload area */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors
            ${dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Caricamento...</span>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-full bg-secondary">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <span className="text-sm text-foreground font-medium">Clicca o trascina un file</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WebP, GIF - max 5MB</p>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
