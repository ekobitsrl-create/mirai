"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { ShoppingBag, Check, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus } from "lucide-react"

function formatCategory(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  sizes: string[] | null
  in_stock: boolean
  is_new: boolean
  created_at: string
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product
  relatedProducts: Product[]
}) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const sizes = product.sizes || []

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize || "unica",
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#6b5f7d] mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#1a1025] transition-colors">{t.productDetail.home}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/collezioni" className="hover:text-[#1a1025] transition-colors">{t.productDetail.collections}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/collezione/${product.category}`} className="hover:text-[#1a1025] transition-colors">{formatCategory(product.category)}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#1a1025]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image */}
        <div className="animate-fade-up">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#e4e0ec]">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-[#6b5f7d]/30" />
              </div>
            )}
            {product.is_new && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-[#1a1025] text-white rounded-full">
                {t.products.new}
              </span>
            )}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="px-6 py-3 text-sm font-bold tracking-[0.2em] uppercase bg-white text-[#1a1025] rounded-full">
                  {t.products.outOfStock}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col animate-fade-up delay-100">
          {/* Category tag */}
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#8b5cf6] mb-3">
            {formatCategory(product.category)}
          </span>

          {/* Name */}
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1025] leading-tight text-balance">
            {product.name}
          </h1>

          {/* Price */}
          <p className="mt-4 text-2xl lg:text-3xl font-bold text-[#1a1025]">
            {"\u20AC"}{product.price.toFixed(2)}
          </p>

          {/* Description */}
          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-[#6b5f7d]">
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#1a1025]">{t.products.size}</span>
                {sizeError && (
                  <span className="text-xs text-red-500 tracking-wide">{t.products.selectSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className={`min-w-[48px] px-4 py-2.5 text-xs font-bold tracking-widest uppercase border rounded-lg transition-all ${
                      selectedSize === size
                        ? "bg-[#1a1025] text-white border-[#1a1025]"
                        : "bg-white text-[#1a1025] border-[#d4d0dc] hover:border-[#1a1025]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#1a1025] mb-3 block">
              {t.products.quantity}
            </span>
            <div className="inline-flex items-center border border-[#d4d0dc] rounded-lg bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-[#6b5f7d] hover:text-[#1a1025] transition-colors"
                aria-label={t.productDetail.reduceQuantity}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-5 py-2.5 text-sm font-bold text-[#1a1025] min-w-[48px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-[#6b5f7d] hover:text-[#1a1025] transition-colors"
                aria-label={t.productDetail.increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || added}
              className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all ${
                added
                  ? "bg-green-600 text-white"
                  : product.in_stock
                    ? "bg-[#1a1025] text-white hover:bg-[#2a1f3d] active:scale-[0.98]"
                    : "bg-[#d4d0dc] text-[#6b5f7d] cursor-not-allowed"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  {t.products.addedToCart}
                </>
              ) : product.in_stock ? (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  {t.products.addToCart}
                </>
              ) : (
                t.products.outOfStock
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 py-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0ecf7]">
                <Truck className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1a1025]">{t.productDetail.freeShipping}</p>
                <p className="text-[10px] text-[#6b5f7d]">{t.productDetail.freeShippingDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0ecf7]">
                <RotateCcw className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1a1025]">{t.productDetail.freeReturn}</p>
                <p className="text-[10px] text-[#6b5f7d]">{t.productDetail.freeReturnDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0ecf7]">
                <Shield className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1a1025]">{t.productDetail.securePayment}</p>
                <p className="text-[10px] text-[#6b5f7d]">{t.productDetail.securePaymentDesc}</p>
              </div>
            </div>
          </div>

          {/* Product Details Accordion */}
          <div className="mt-8 border-t border-[#e4e0ec]">
            <details className="group" open>
              <summary className="flex items-center justify-between py-4 cursor-pointer text-xs font-bold tracking-[0.2em] uppercase text-[#1a1025]">
                Dettagli Prodotto
                <ChevronRight className="h-4 w-4 text-[#6b5f7d] transition-transform group-open:rotate-90" />
              </summary>
              <div className="pb-4 text-sm text-[#6b5f7d] leading-relaxed space-y-2">
                <p>{product.description || "Capo di abbigliamento di alta qualita, progettato per il massimo comfort e stile."}</p>
                <ul className="list-disc pl-5 space-y-1 text-[13px]">
                  <li>{"Materiali di alta qualit\u00E0"}</li>
                  <li>{"Design esclusivo MIR\u039BI"}</li>
                  <li>Vestibilita regolare</li>
                  {sizes.length > 0 && <li>Taglie disponibili: {sizes.join(", ")}</li>}
                </ul>
              </div>
            </details>
            <details className="group border-t border-[#e4e0ec]">
              <summary className="flex items-center justify-between py-4 cursor-pointer text-xs font-bold tracking-[0.2em] uppercase text-[#1a1025]">
                {t.productDetail.shippingReturns}
                <ChevronRight className="h-4 w-4 text-[#6b5f7d] transition-transform group-open:rotate-90" />
              </summary>
              <div className="pb-4 text-sm text-[#6b5f7d] leading-relaxed space-y-2">
                <p>{t.productDetail.shippingInfo}</p>
                <p>{t.productDetail.returnInfo}</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xl font-bold tracking-tight text-[#1a1025] mb-8">
            Potrebbe Piacerti Anche
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/prodotto/${item.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#e4e0ec] mb-3">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-[#6b5f7d]/30" />
                    </div>
                  )}
                  {item.is_new && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-[9px] font-bold tracking-[0.15em] uppercase bg-[#1a1025] text-white rounded-full">
                      Nuovo
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8b5cf6] mb-1">
                  {formatCategory(item.category)}
                </p>
                <h3 className="text-sm font-medium text-[#1a1025] group-hover:text-[#8b5cf6] transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm font-bold text-[#1a1025] mt-1">
                  {"\u20AC"}{item.price.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
