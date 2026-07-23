"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
  ZoomIn,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProductSupplierSettings, type StoreProduct } from "@/lib/products"

function formatCategory(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price))
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: StoreProduct
  relatedProducts: StoreProduct[]
}) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [wished, setWished] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quickPaymentLoading, setQuickPaymentLoading] = useState<"paypal" | "klarna" | "scalapay" | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const sizes = product.sizes || []
  const selectedStock = selectedSize ? product.stock_by_size?.[selectedSize] : undefined
  const maxQuantity = selectedStock ?? 10
  const colorName = product.color_name || "Multicolor"
  const fitNote = product.fit_note || "Consulta la guida alle taglie prima di scegliere."
  const supplierSettings = getProductSupplierSettings(product)
  const isFragrance = ["profumi", "profumo", "fragrance", "fragrances"].includes(
    product.category.trim().toLowerCase(),
  )
  const returnCondition = isFragrance
    ? "purché il prodotto sia integro e nella confezione originale"
    : "purché il capo sia integro e con i cartellini originali"
  const isMiraiSupplierCatalogProduct = /^MIRAI-/i.test(product.supplier_sku || "")
    || product.image_url?.includes("/products/mirai-supplier/") === true
  const shippingEstimate = supplierSettings.shippingMinDays !== undefined && supplierSettings.shippingMaxDays !== undefined
    ? `consegna stimata in ${supplierSettings.shippingMinDays}–${supplierSettings.shippingMaxDays} giorni lavorativi`
    : "preparazione 1–2 giorni, consegna standard 3–5 giorni lavorativi"
  const detailItems = product.detail_items || []
  const gallery = product.image_gallery?.length
    ? product.image_gallery
    : product.image_url
      ? [{ src: product.image_url, alt: product.name, fit: "contain" as const }]
      : []
  const selectedImage = gallery[selectedImageIndex] || gallery[0]

  useEffect(() => {
    try {
      const wishlist = JSON.parse(window.localStorage.getItem("mirai-wishlist") || "[]")
      setWished(Array.isArray(wishlist) && wishlist.includes(product.id))
    } catch {
      // Wishlist persistence is optional.
    }
  }, [product.id])

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [product.id])

  useEffect(() => {
    document.body.style.overflow = zoomOpen || sizeGuideOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [sizeGuideOpen, zoomOpen])

  function toggleWishlist() {
    setWished((current) => {
      const next = !current
      try {
        const wishlist = JSON.parse(window.localStorage.getItem("mirai-wishlist") || "[]")
        const ids = Array.isArray(wishlist) ? wishlist : []
        window.localStorage.setItem(
          "mirai-wishlist",
          JSON.stringify(next ? [...new Set([...ids, product.id])] : ids.filter((id) => id !== product.id))
        )
      } catch {
        // Keep the interaction available when storage is blocked.
      }
      return next
    })
  }

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    if (selectedStock !== undefined && selectedStock <= 0) {
      setSizeError(true)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      size: selectedSize || "OS",
      quantity,
      maxQuantity,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  async function handleQuickPayment(paymentMethod: "paypal" | "klarna" | "scalapay") {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    if (selectedStock !== undefined && selectedStock <= 0) {
      setSizeError(true)
      return
    }

    setPaymentError(null)
    setQuickPaymentLoading(paymentMethod)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              quantity,
              size: selectedSize || "OS",
            },
          ],
          paymentMethod,
          cancelPath: `/prodotto/${product.id}`,
        }),
      })
      const result = await response.json()

      if (response.status === 401 && result.authRequired) {
        window.location.assign(`/auth/sign-up?next=${encodeURIComponent(`/prodotto/${product.id}`)}`)
        return
      }

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Pagamento momentaneamente non disponibile")
      }

      window.location.assign(result.url)
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Pagamento momentaneamente non disponibile"
      )
      setQuickPaymentLoading(null)
    }
  }

  async function shareProduct() {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href })
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 text-[#faf8ff] md:px-8">
      <nav className="mb-7 flex items-center gap-1.5 overflow-hidden text-[9px] font-medium uppercase tracking-[0.2em] text-white/50" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-white">Home</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/collezioni" className="shrink-0 hover:text-white">Shop</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/collezione/${product.category}`} className="shrink-0 hover:text-white">{formatCategory(product.category)}</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="truncate text-white/85">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(400px,.75fr)] lg:gap-12 xl:gap-20">
        <section className="grid gap-3 md:grid-cols-[72px_minmax(0,1fr)]">
          <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
            {gallery.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Mostra immagine ${index + 1} di ${gallery.length}`}
                aria-current={selectedImageIndex === index ? "true" : undefined}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-[#d9d4ca] transition-all md:w-[72px] ${selectedImageIndex === index ? "shadow-[0_0_28px_rgba(159,134,255,0.48)]" : "opacity-55 shadow-[0_0_18px_rgba(126,87,194,0.08)] hover:opacity-100 hover:shadow-[0_0_24px_rgba(159,134,255,0.25)]"}`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  className={isMiraiSupplierCatalogProduct || image.fit === "cover" ? "object-cover" : "object-contain"}
                  style={{ objectPosition: image.position || "center" }}
                  sizes="72px"
                />
              </button>
            ))}
            {gallery.length > 0 && (
              <div className="hidden aspect-square w-[72px] items-center justify-center border border-white/15 bg-white/[0.06] text-[8px] uppercase tracking-[0.16em] text-white/45 md:flex">
                {String(selectedImageIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            disabled={!selectedImage}
            className="mirai-neon-frame mirai-neon-breathe group relative order-1 aspect-square min-w-0 overflow-hidden rounded-[1.75rem] bg-[#d8d2c7] md:order-2"
            aria-label="Ingrandisci immagine prodotto"
          >
            {selectedImage ? (
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className={`${isMiraiSupplierCatalogProduct || selectedImage.fit === "cover" ? "object-cover" : "object-contain"} transition-transform duration-700 group-hover:scale-[1.025]`}
                style={{ objectPosition: selectedImage.position || "center" }}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center"><ShoppingBag className="h-16 w-16 text-black/15" /></span>
            )}
            <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-[#17101f]/85 text-white shadow-[0_0_22px_rgba(159,134,255,0.28)] backdrop-blur-md transition-transform group-hover:scale-105">
              <ZoomIn className="h-4 w-4" />
            </span>
            {product.is_new && (
              <span className="absolute left-4 top-4 bg-[#9f86ff] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black">Novità</span>
            )}
          </button>
        </section>

        <section className="mirai-neon-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7 lg:!sticky lg:top-32 lg:self-start lg:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9f86ff]">MIRAI LAB / {product.brand || formatCategory(product.category)}</p>
              <h1 className="mt-3 max-w-xl text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl md:text-4xl">{product.name}</h1>
              {product.supplier_sku && <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-white/40">Codice {product.supplier_sku}</p>}
              <p className="mt-5 text-lg font-medium">{formatPrice(product.price)}</p>
              <p className="mt-1 text-[10px] text-white/55">IVA inclusa</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={shareProduct} className="flex h-10 w-10 items-center justify-center text-white/35 hover:text-white" aria-label="Condividi prodotto"><Share2 className="h-4 w-4" /></button>
              <button type="button" onClick={toggleWishlist} className={`flex h-10 w-10 items-center justify-center border transition-all ${wished ? "border-[#9f86ff] bg-[#9f86ff] text-black shadow-[0_0_24px_rgba(159,134,255,0.45)]" : "border-white/20 bg-white/[0.04] text-white/75 hover:border-primary/70 hover:text-white"}`} aria-label={wished ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}>
                <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {product.description && <p className="mt-7 max-w-xl text-sm leading-6 text-white/70">{product.description}</p>}

          <div className="mt-8 border-t border-white/15 pt-7">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">Colore</p>
              <span className="text-xs text-white/65">{colorName}</span>
            </div>
            <button type="button" className="mt-3 flex items-center gap-2 border border-white/30 bg-white/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
              <span className="h-3 w-3 rounded-full border border-white/25" style={{ backgroundColor: product.color_hex || "#ffffff" }} /> {colorName}
            </button>
          </div>

          {sizes.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">Taglia</p>
                <button type="button" onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1.5 text-[10px] text-white/60 underline decoration-primary/40 underline-offset-4 hover:text-white">
                  <Ruler className="h-3.5 w-3.5" /> Guida alle taglie
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {sizes.map((size) => (
                  (() => {
                    const sizeStock = product.stock_by_size?.[size]
                    const soldOut = sizeStock !== undefined && sizeStock <= 0
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={soldOut}
                        onClick={() => {
                          setSelectedSize(size)
                          setQuantity((value) => Math.max(1, Math.min(value, sizeStock ?? 10)))
                          setSizeError(false)
                        }}
                        aria-label={soldOut ? `Taglia ${size} esaurita` : sizeStock !== undefined ? `Taglia ${size}, ${sizeStock} disponibili` : `Taglia ${size}`}
                        className={`border py-3 text-xs font-medium transition-all ${soldOut ? "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/25 line-through" : selectedSize === size ? "border-[#9f86ff] bg-[#9f86ff] text-black shadow-[0_0_20px_rgba(159,134,255,0.35)]" : "border-white/20 bg-white/[0.035] text-white/75 hover:border-primary/70 hover:text-white"}`}
                      >
                        {size}
                      </button>
                    )
                  })()
                ))}
              </div>
              <p className={`mt-2 min-h-4 text-[10px] transition-colors ${sizeError ? "text-[#ff9b9b]" : "text-white/50"}`}>
                {sizeError
                  ? selectedStock !== undefined && selectedStock <= 0
                    ? "Questa taglia è esaurita. Scegline un'altra."
                    : "Seleziona una taglia prima di continuare."
                  : selectedStock !== undefined
                    ? `${fitNote} Disponibilità: ${selectedStock} ${selectedStock === 1 ? "pezzo" : "pezzi"}.`
                    : fitNote}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <div className="flex h-14 shrink-0 items-center border border-white/20 bg-black/10">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-10 items-center justify-center text-white/45 hover:text-white" aria-label="Riduci quantità"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-8 text-center text-xs font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} className="flex h-full w-10 items-center justify-center text-white/45 hover:text-white" aria-label="Aumenta quantità"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`flex h-14 flex-1 items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.22em] transition-all ${added ? "bg-emerald-400 text-black" : product.in_stock ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(159,134,255,0.38)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_42px_rgba(159,134,255,0.55)]" : "cursor-not-allowed bg-white/10 text-white/30"}`}
            >
              {added ? <><Check className="h-4 w-4" /> Aggiunto</> : product.in_stock ? <><ShoppingBag className="h-4 w-4" /> Aggiungi al carrello</> : "Esaurito"}
            </button>
          </div>

          {product.in_stock && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  oppure paga subito
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleQuickPayment("paypal")}
                  disabled={quickPaymentLoading !== null}
                  className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#ffc439] px-4 text-sm font-black italic tracking-[-0.03em] text-[#003087] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                >
                  {quickPaymentLoading === "paypal" && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Pay<span className="text-[#009cde]">Pal</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayment("klarna")}
                  disabled={quickPaymentLoading !== null}
                  className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#ffb3c7] px-4 text-sm font-black tracking-[-0.03em] text-[#17120f] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                >
                  {quickPaymentLoading === "klarna" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Klarna.
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayment("scalapay")}
                  disabled={quickPaymentLoading !== null}
                  className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#f1c4df] px-4 text-sm font-black tracking-[-0.03em] text-[#17120f] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
                >
                  {quickPaymentLoading === "scalapay" && <Loader2 className="h-4 w-4 animate-spin" />}
                  scalapay
                </button>
              </div>
              <p className="mt-2 text-center text-[9px] leading-4 text-white/50">
                Checkout sicuro gestito da Stripe. Spedizione e indirizzo vengono scelti nel passaggio successivo.
              </p>
              {paymentError && (
                <p className="mt-2 text-center text-[10px] text-[#ff9b9b]" role="alert">
                  {paymentError}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[10px] text-white/60">
            <PackageCheck className="h-4 w-4 text-emerald-400" />
            {product.in_stock
              ? `Disponibile — ${shippingEstimate}`
              : `Momentaneamente non disponibile — ${shippingEstimate}`}
          </div>

          <div className="mt-8 grid grid-cols-3 border-y border-white/15 bg-white/[0.025] py-5">
            <TrustItem icon={Truck} title="Spedizione gratuita" detail="Sempre" />
            <TrustItem icon={RotateCcw} title="Reso facile" detail="Entro 14 giorni" bordered />
            <TrustItem icon={ShieldCheck} title="Pagamento" detail="Protetto da Stripe" />
          </div>

          <div className="mt-1">
            <Details title="Dettagli prodotto" open>
              {detailItems.length > 0 ? (
                <ul className="space-y-1.5">
                  {detailItems.map((detail) => <li key={detail}>• {detail}</li>)}
                </ul>
              ) : product.description}
            </Details>
            {(product.composition || product.care) && (
              <Details title="Composizione e cura">
                {product.composition && <p>{product.composition}</p>}
                {product.care && <p className={product.composition ? "mt-2" : undefined}>{product.care}</p>}
              </Details>
            )}
            <Details title="Spedizioni e resi">
              Tempi previsti: {shippingEstimate}. Spedizione tracciata in Italia e in Europa. Puoi richiedere il reso entro 14 giorni dalla consegna, {returnCondition}. Consulta la pagina <Link href="/resi" className="text-[#9f86ff] underline underline-offset-4">Resi e Rimborsi</Link>.
            </Details>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-primary/25 pt-12 md:mt-32 md:pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#9f86ff]">Complete the look</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em]">Potrebbe piacerti</h2>
            </div>
            <Link href="/collezioni" className="hidden border-b border-white/30 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/50 hover:text-white sm:block">Shop all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/prodotto/${item.id}`} className="group min-w-0">
                <div className="mirai-neon-frame mirai-neon-lift relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-white/5">
                  {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" sizes="(max-width: 768px) 50vw, 25vw" />}
                </div>
                <h3 className="truncate text-xs font-medium group-hover:text-[#9f86ff]">{item.name}</h3>
                <p className="mt-1 text-xs text-white/45">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {zoomOpen && selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 md:p-10">
          <button type="button" onClick={() => setZoomOpen(false)} className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black" aria-label="Chiudi immagine"><X className="h-5 w-5" /></button>
          <div className={`relative h-full w-full overflow-hidden ${isMiraiSupplierCatalogProduct || selectedImage.fit === "cover" ? "max-w-3xl" : "max-w-6xl"}`}>
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              className={isMiraiSupplierCatalogProduct || selectedImage.fit === "cover" ? "object-cover" : "object-contain"}
              style={{ objectPosition: selectedImage.position || "center" }}
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}

      {sizeGuideOpen && (
        <SizeGuide product={product} onClose={() => setSizeGuideOpen(false)} />
      )}
    </div>
  )
}

function TrustItem({ icon: Icon, title, detail, bordered = false }: { icon: typeof Truck; title: string; detail: string; bordered?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-2 text-center ${bordered ? "border-x border-white/10" : ""}`}>
      <Icon className="mb-2 h-4 w-4 text-[#9f86ff]" />
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em]">{title}</p>
      <p className="mt-1 text-[9px] text-white/55">{detail}</p>
    </div>
  )
}

function Details({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-white/10" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-white/35 transition-transform group-open:rotate-180" />
      </summary>
      <div className="max-w-xl pb-5 text-xs leading-6 text-white/65">{children}</div>
    </details>
  )
}

function SizeGuide({ product, onClose }: { product: StoreProduct; onClose: () => void }) {
  const rows = [
    ["S", "52", "69", "22"],
    ["M", "55", "71", "23"],
    ["L", "58", "73", "24"],
    ["XL", "61", "75", "25"],
  ]
  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center md:items-center md:p-6">
      <button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-label="Chiudi guida taglie" />
      <div className="relative w-full max-w-2xl bg-[#141416] p-6 text-white shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[9px] uppercase tracking-[0.26em] text-[#9f86ff]">MIRAI fit guide</p><h2 className="mt-2 text-2xl font-medium">Guida alle taglie</h2></div>
          <button type="button" onClick={onClose} className="p-1 text-white/40 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-5 text-xs leading-6 text-white/45">{product.fit_note || "Scegli la tua taglia abituale."}</p>
        {product.id === "71a11e7e-5b68-4e2c-9f65-0dca2b967104" ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="border-b border-white/15 text-[9px] uppercase tracking-[0.16em] text-white/35"><tr><th className="py-3">Taglia</th><th className="py-3">Torace</th><th className="py-3">Lunghezza</th><th className="py-3">Manica</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row[0]} className="border-b border-white/10">{row.map((value) => <td key={value} className="py-4">{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Taglie disponibili</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span key={size} className="border border-white/15 px-4 py-3 text-xs">
                  {size}{product.stock_by_size?.[size] !== undefined ? ` · ${product.stock_by_size[size]} pz` : ""}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[10px] leading-5 text-white/40">Le misure precise possono variare in base al modello. Per una verifica prima dell'acquisto contatta l'assistenza indicando il codice {product.supplier_sku || product.id}.</p>
          </div>
        )}
        <button type="button" onClick={onClose} className="mt-7 w-full bg-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-[#9f86ff]">Ho capito</button>
      </div>
    </div>
  )
}
