"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react"

type GalleryImage = {
  src: string
  alt: string
  fit: "contain" | "cover"
  position: string
}

type AdminProductGalleryProps = {
  defaultPrimary?: string | null
  defaultGallery?: unknown
  productName?: string
}

const MAX_GALLERY_IMAGES = 20

function isSupportedImageUrl(value: unknown): value is string {
  return typeof value === "string" && (/^https?:\/\//i.test(value) || value.startsWith("/"))
}

function normalizeGallery(
  primary: string | null | undefined,
  gallery: unknown,
  productName: string,
) {
  const images: GalleryImage[] = []

  const addImage = (candidate: unknown) => {
    const source = typeof candidate === "string"
      ? candidate
      : candidate && typeof candidate === "object" && "src" in candidate
        ? (candidate as { src?: unknown }).src
        : null

    if (!isSupportedImageUrl(source) || images.some((image) => image.src === source)) return

    const details = candidate && typeof candidate === "object"
      ? candidate as { alt?: unknown; fit?: unknown; position?: unknown }
      : null

    images.push({
      src: source,
      alt: typeof details?.alt === "string" && details.alt.trim()
        ? details.alt.trim()
        : productName || "Immagine prodotto",
      fit: details?.fit === "cover" ? "cover" : "contain",
      position: typeof details?.position === "string" && details.position.trim()
        ? details.position.trim()
        : "center",
    })
  }

  if (Array.isArray(gallery)) gallery.forEach(addImage)

  if (isSupportedImageUrl(primary)) {
    const primaryIndex = images.findIndex((image) => image.src === primary)
    if (primaryIndex === -1) {
      images.unshift({
        src: primary,
        alt: productName || "Immagine prodotto",
        fit: "contain",
        position: "center",
      })
    } else if (primaryIndex > 0) {
      const [primaryImage] = images.splice(primaryIndex, 1)
      images.unshift(primaryImage)
    }
  }

  return images.slice(0, MAX_GALLERY_IMAGES)
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })
  const result = await response.json() as { url?: string; error?: string }

  if (!response.ok || !isSupportedImageUrl(result.url)) {
    throw new Error(result.error || `Upload di ${file.name} non riuscito`)
  }

  return result.url
}

export function AdminProductGallery({
  defaultPrimary,
  defaultGallery,
  productName = "",
}: AdminProductGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(() =>
    normalizeGallery(defaultPrimary, defaultGallery, productName),
  )
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const primaryUrl = images[0]?.src || ""

  async function addFiles(fileList: FileList | File[]) {
    if (uploading) return
    const files = Array.from(fileList)
    if (files.length === 0) return

    const availableSlots = Math.max(0, MAX_GALLERY_IMAGES - images.length)
    if (availableSlots === 0) {
      setError(`Puoi inserire al massimo ${MAX_GALLERY_IMAGES} immagini.`)
      return
    }

    const selectedFiles = files.slice(0, availableSlots)
    setError(files.length > availableSlots
      ? `Carico le prime ${availableSlots} immagini: il limite e ${MAX_GALLERY_IMAGES}.`
      : null)
    setUploading(true)

    const results = await Promise.allSettled(selectedFiles.map(uploadImage))
    const uploadedUrls = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : [])
    const failures = results.filter((result) => result.status === "rejected")

    if (uploadedUrls.length > 0) {
      setImages((current) => {
        const next = [...current]
        for (const src of uploadedUrls) {
          if (next.some((image) => image.src === src)) continue
          next.push({
            src,
            alt: productName || "Immagine prodotto",
            fit: "contain",
            position: "center",
          })
        }
        return next.slice(0, MAX_GALLERY_IMAGES)
      })
    }

    if (failures.length > 0) {
      const firstFailure = failures[0]
      const message = firstFailure.status === "rejected" && firstFailure.reason instanceof Error
        ? firstFailure.reason.message
        : "Alcune immagini non sono state caricate."
      setError(`${failures.length} upload non riusciti. ${message}`)
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  function moveImage(index: number, direction: -1 | 1) {
    const destination = index + direction
    if (destination < 0 || destination >= images.length) return

    setImages((current) => {
      const next = [...current]
      const [image] = next.splice(index, 1)
      next.splice(destination, 0, image)
      return next
    })
  }

  function makePrimary(index: number) {
    if (index === 0) return
    setImages((current) => {
      const next = [...current]
      const [image] = next.splice(index, 1)
      next.unshift(image)
      return next
    })
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-4 md:col-span-2">
      <input type="hidden" name="image_url" value={primaryUrl} />
      <input type="hidden" name="image_gallery" value={JSON.stringify(images)} />

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Galleria prodotto
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            La prima immagine e la copertina. Puoi riordinare, eliminare o scegliere una nuova principale.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading || images.length >= MAX_GALLERY_IMAGES}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Caricamento..." : "Carica immagini"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files)
        }}
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <article
              key={image.src}
              className={`overflow-hidden rounded-lg border bg-background ${index === 0 ? "border-primary ring-1 ring-primary/40" : "border-border"}`}
            >
              <div className="relative aspect-square w-full bg-secondary">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className={image.fit === "cover" ? "object-cover" : "object-contain"}
                  style={{ objectPosition: image.position }}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                />
                <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-sm">
                  {index === 0 ? "Principale" : `Foto ${index + 1}`}
                </span>
              </div>

              <div className="grid grid-cols-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="flex h-9 items-center justify-center border-r border-border text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-25"
                  aria-label={`Sposta foto ${index + 1} a sinistra`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="flex h-9 items-center justify-center border-r border-border text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-25"
                  aria-label={`Sposta foto ${index + 1} a destra`}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => makePrimary(index)}
                  disabled={index === 0}
                  className="flex h-9 items-center justify-center border-r border-border text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:text-primary disabled:opacity-100"
                  aria-label={index === 0 ? "Foto principale" : `Imposta foto ${index + 1} come principale`}
                >
                  <Star className={`h-3.5 w-3.5 ${index === 0 ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="flex h-9 items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Elimina foto ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            void addFiles(event.dataTransfer.files)
          }}
          className={`flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"}`}
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {uploading ? "Caricamento immagini..." : "Clicca o trascina qui piu immagini"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            JPG, PNG, WebP, AVIF o GIF - massimo 5 MB ciascuna
          </span>
        </button>
      )}

      {images.length > 0 && (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            void addFiles(event.dataTransfer.files)
          }}
          className={`rounded-md border border-dashed px-3 py-2 text-center text-[11px] text-muted-foreground ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
        >
          Trascina altre immagini qui - {images.length}/{MAX_GALLERY_IMAGES}
        </div>
      )}

      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </section>
  )
}
