import { randomUUID } from "node:crypto"
import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/admin"
import { consumeRateLimit, isSameOriginRequest } from "@/lib/request-security"
import { getServerUserWithProfile } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 5 * 1024 * 1024

type DetectedImage = { mime: string; extension: string }

function detectImage(bytes: Uint8Array): DetectedImage | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" }
  }
  if (bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return { mime: "image/png", extension: "png" }
  }
  if (bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    return { mime: "image/webp", extension: "webp" }
  }
  if (bytes.length >= 6) {
    const signature = String.fromCharCode(...bytes.slice(0, 6))
    if (signature === "GIF87a" || signature === "GIF89a") {
      return { mime: "image/gif", extension: "gif" }
    }
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp") {
    const brand = String.fromCharCode(...bytes.slice(8, 12))
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", extension: "avif" }
  }
  return null
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine non valida" }, { status: 403 })
  }

  const { user, profile } = await getServerUserWithProfile()
  if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 })
  }

  if (!await consumeRateLimit({ bucket: "admin-upload", limit: 15, windowSeconds: 600, request })) {
    return NextResponse.json({ error: "Troppi caricamenti. Riprova più tardi." }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const value = formData.get("file")
    if (!(value instanceof File)) {
      return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 })
    }
    if (value.size < 1 || value.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File non valido. Dimensione massima 5 MB." }, { status: 400 })
    }

    const bytes = new Uint8Array(await value.arrayBuffer())
    const detected = detectImage(bytes)
    if (!detected) {
      return NextResponse.json({ error: "Immagine non valida o formato non supportato." }, { status: 400 })
    }

    const filename = `${randomUUID()}.${detected.extension}`
    const blob = await put(`mirai/${filename}`, Buffer.from(bytes), {
      access: "public",
      contentType: detected.mime,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      filename,
      size: value.size,
      type: detected.mime,
    })
  } catch (error) {
    console.error("[upload] Upload failed", error instanceof Error ? error.name : "unknown")
    return NextResponse.json({ error: "Upload fallito" }, { status: 500 })
  }
}
