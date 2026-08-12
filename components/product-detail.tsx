"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  TrendingUp,
  X,
  ZoomIn,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import {
  getProductSupplierSettings,
  type StoreProduct,
  type StoreProductImage,
} from "@/lib/products"
import { getProductVariantKey } from "@/lib/product-titles"
import { getCatalogItemId } from "@/lib/catalog-identifiers"
import { MetaPixelEvent } from "@/components/meta-pixel-event"
import { PostHogCommerceEvent } from "@/components/posthog-commerce-event"
import { useLanguage } from "@/lib/language-context"
import type { Locale } from "@/lib/translations"
import {
  formatLocalizedPrice,
  translateCategory,
} from "@/lib/site-localization"
import { localizeColor, localizeProduct, translateProductName } from "@/lib/catalog-localization"

function formatCategory(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const FIRST_ORDER_DISCOUNT_PERCENT = 10
const MIN_MONTHLY_SOLD = 7
const MONTHLY_SOLD_RANGE = 14

function getTestMonthlySoldCount(productId: string) {
  let hash = 2166136261

  for (let index = 0; index < productId.length; index += 1) {
    hash ^= productId.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return MIN_MONTHLY_SOLD + ((hash >>> 0) % MONTHLY_SOLD_RANGE)
}

type ProductGalleryView = StoreProductImage & {
  label: string
}

function getGalleryViews(product: StoreProduct, labels: string[]): ProductGalleryView[] {
  const originalGallery = product.image_gallery?.length
    ? product.image_gallery
    : product.image_url
      ? [{ src: product.image_url, alt: product.name, fit: "contain" as const }]
      : []

  if (!originalGallery.length) return []

  return originalGallery.map((image, index) => ({
    ...image,
    label: labels[index] || `${labels[5]} ${index + 1}`,
  }))
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: StoreProduct
  relatedProducts: StoreProduct[]
}) {
  const { addItem, items: cartItems, updateQuantity } = useCart()
  const { locale } = useLanguage()
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [wished, setWished] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quickPaymentLoading, setQuickPaymentLoading] = useState<"paypal" | "klarna" | "scalapay" | null>(null)
  const purchaseRef = useRef<HTMLDivElement>(null)

  const sizes = product.sizes || []
  const selectedStock = selectedSize ? product.stock_by_size?.[selectedSize] : undefined
  const maxQuantity = selectedStock ?? 10
  const productCopy = {
    it: {
      gallery: ["Vista completa", "Retro", "Dettaglio", "Indossata", "Finiture", "Vista"], newProduct: "Novità", defaultColor: "Multicolor", defaultFit: "Consulta la guida alle taglie prima di scegliere.",
      garmentCondition: "purché il capo sia integro e con i cartellini originali", fragranceCondition: "purché il prodotto sia integro e nella confezione originale",
      delivery: "consegna stimata", workingDays: "giorni lavorativi", sold: "Venduti questo mese", firstOrder: "Primo ordine", withCode: "con MIRAI10",
      tax: "IVA inclusa", save: "risparmi", checkoutCode: "applicando il codice nel checkout", color: "Colore", variant: "Variante", size: "Taglia", sizeGuide: "Guida alle taglie",
      sizeSoldOut: "Questa taglia è esaurita. Scegline un'altra.", selectSize: "Seleziona una taglia prima di continuare.", available: "Disponibile", availability: "Disponibilità", piece: "pezzo", pieces: "pezzi",
      added: "Aggiunto", add: "Aggiungi al carrello", soldOut: "Esaurito", productCode: "Codice prodotto", chooseCheckout: "scegli il metodo nel checkout",
      discountBeforePay: "Prima puoi applicare MIRAI10 o un altro codice sconto, poi scegliere il metodo di pagamento.", unavailable: "Momentaneamente non disponibile",
      freeShipping: "Spedizione gratuita", always: "Sempre", easyReturn: "Reso facile", within14: "Entro 14 giorni", payment: "Pagamento", stripe: "Protetto da Stripe",
      details: "Dettagli prodotto", composition: "Composizione e cura", shippingReturns: "Spedizioni e resi", expected: "Tempi previsti", tracked: "Spedizione tracciata in Italia e in Europa.",
      returnText: "Per gli ordini consegnati in Italia il reso è gratuito: puoi richiederlo entro 14 giorni di calendario dalla consegna", returnEnd: "MIRAI fornisce l'etichetta prepagata e non applica costi di restocking. Consulta la pagina", returns: "Resi e Rimborsi",
      complete: "Complete the look", mayLike: "Potrebbe piacerti", shopAll: "Shop all", closeImage: "Chiudi immagine", chooseSize: "Scegli taglia", fitGuide: "MIRAI fit guide", availableSizes: "Taglie disponibili",
      chest: "Torace", length: "Lunghezza", sleeve: "Manica", close: "Chiudi", understood: "Ho capito", precise: "Le misure precise possono variare in base al modello. Per una verifica prima dell'acquisto contatta l'assistenza indicando il codice",
    },
    en: {
      gallery: ["Full view", "Back", "Detail", "Worn", "Finishes", "View"], newProduct: "New", defaultColor: "Multicolour", defaultFit: "Check the size guide before choosing.",
      garmentCondition: "provided the garment is intact with its original tags", fragranceCondition: "provided the product is unopened and in its original packaging",
      delivery: "estimated delivery in", workingDays: "business days", sold: "Sold this month", firstOrder: "First order", withCode: "with MIRAI10",
      tax: "VAT included", save: "save", checkoutCode: "by applying the code at checkout", color: "Colour", variant: "Variant", size: "Size", sizeGuide: "Size guide",
      sizeSoldOut: "This size is sold out. Choose another one.", selectSize: "Select a size before continuing.", available: "Available", availability: "Availability", piece: "item", pieces: "items",
      added: "Added", add: "Add to cart", soldOut: "Sold out", productCode: "Product code", chooseCheckout: "choose the method at checkout",
      discountBeforePay: "Apply MIRAI10 or another discount code first, then choose your payment method.", unavailable: "Temporarily unavailable",
      freeShipping: "Free shipping", always: "Always", easyReturn: "Easy return", within14: "Within 14 days", payment: "Payment", stripe: "Secured by Stripe",
      details: "Product details", composition: "Composition and care", shippingReturns: "Shipping and returns", expected: "Expected timing", tracked: "Tracked shipping in Italy and across Europe.",
      returnText: "Returns are free for orders delivered in Italy: request one within 14 calendar days of delivery", returnEnd: "MIRAI provides a prepaid label and charges no restocking fee. See", returns: "Returns and Refunds",
      complete: "Complete the look", mayLike: "You may also like", shopAll: "Shop all", closeImage: "Close image", chooseSize: "Choose size", fitGuide: "MIRAI fit guide", availableSizes: "Available sizes",
      chest: "Chest", length: "Length", sleeve: "Sleeve", close: "Close", understood: "Got it", precise: "Measurements may vary by style. To check before buying, contact support and quote code",
    },
    es: {
      gallery: ["Vista completa", "Parte trasera", "Detalle", "Puesto", "Acabados", "Vista"], newProduct: "Nuevo", defaultColor: "Multicolor", defaultFit: "Consulta la guía de tallas antes de elegir.",
      garmentCondition: "siempre que la prenda esté intacta y conserve las etiquetas originales", fragranceCondition: "siempre que el producto esté intacto y en su embalaje original",
      delivery: "entrega estimada en", workingDays: "días laborables", sold: "Vendidos este mes", firstOrder: "Primer pedido", withCode: "con MIRAI10",
      tax: "IVA incluido", save: "ahorras", checkoutCode: "aplicando el código en el checkout", color: "Color", variant: "Variante", size: "Talla", sizeGuide: "Guía de tallas",
      sizeSoldOut: "Esta talla está agotada. Elige otra.", selectSize: "Selecciona una talla antes de continuar.", available: "Disponible", availability: "Disponibilidad", piece: "unidad", pieces: "unidades",
      added: "Añadido", add: "Añadir al carrito", soldOut: "Agotado", productCode: "Código de producto", chooseCheckout: "elige el método en el checkout",
      discountBeforePay: "Primero aplica MIRAI10 u otro código de descuento y después elige el método de pago.", unavailable: "No disponible temporalmente",
      freeShipping: "Envío gratuito", always: "Siempre", easyReturn: "Devolución fácil", within14: "En 14 días", payment: "Pago", stripe: "Protegido por Stripe",
      details: "Detalles del producto", composition: "Composición y cuidado", shippingReturns: "Envíos y devoluciones", expected: "Plazo previsto", tracked: "Envío con seguimiento en Italia y Europa.",
      returnText: "Las devoluciones son gratuitas para los pedidos entregados en Italia: solicítala en los 14 días naturales siguientes a la entrega", returnEnd: "MIRAI proporciona una etiqueta prepagada y no cobra gastos de reposición. Consulta", returns: "Devoluciones y reembolsos",
      complete: "Completa el look", mayLike: "También te puede gustar", shopAll: "Ver todo", closeImage: "Cerrar imagen", chooseSize: "Elegir talla", fitGuide: "Guía de tallas MIRAI", availableSizes: "Tallas disponibles",
      chest: "Pecho", length: "Largo", sleeve: "Manga", close: "Cerrar", understood: "Entendido", precise: "Las medidas pueden variar según el modelo. Para comprobarlas antes de comprar, contacta con asistencia indicando el código",
    },
    de: {
      gallery: ["Gesamtansicht", "Rückseite", "Detail", "Getragen", "Verarbeitung", "Ansicht"], newProduct: "Neu", defaultColor: "Mehrfarbig", defaultFit: "Bitte prüfe vor der Auswahl die Größentabelle.",
      garmentCondition: "sofern das Kleidungsstück unversehrt ist und die Originaletiketten trägt", fragranceCondition: "sofern das Produkt unversehrt und originalverpackt ist",
      delivery: "voraussichtliche Lieferung in", workingDays: "Werktagen", sold: "Diesen Monat verkauft", firstOrder: "Erste Bestellung", withCode: "mit MIRAI10",
      tax: "inkl. MwSt.", save: "du sparst", checkoutCode: "bei Eingabe des Codes an der Kasse", color: "Farbe", variant: "Variante", size: "Größe", sizeGuide: "Größentabelle",
      sizeSoldOut: "Diese Größe ist ausverkauft. Wähle eine andere.", selectSize: "Wähle eine Größe, bevor du fortfährst.", available: "Verfügbar", availability: "Verfügbarkeit", piece: "Stück", pieces: "Stück",
      added: "Hinzugefügt", add: "In den Warenkorb", soldOut: "Ausverkauft", productCode: "Produktcode", chooseCheckout: "Zahlungsart an der Kasse wählen",
      discountBeforePay: "Wende zuerst MIRAI10 oder einen anderen Rabattcode an und wähle dann die Zahlungsart.", unavailable: "Vorübergehend nicht verfügbar",
      freeShipping: "Kostenloser Versand", always: "Immer", easyReturn: "Einfache Rückgabe", within14: "Innerhalb von 14 Tagen", payment: "Zahlung", stripe: "Durch Stripe geschützt",
      details: "Produktdetails", composition: "Material und Pflege", shippingReturns: "Versand und Rückgabe", expected: "Voraussichtliche Dauer", tracked: "Sendungsverfolgter Versand in Italien und Europa.",
      returnText: "Für nach Italien gelieferte Bestellungen ist die Rückgabe kostenlos: Beantrage sie innerhalb von 14 Kalendertagen nach Zustellung", returnEnd: "MIRAI stellt ein vorausbezahltes Etikett bereit und erhebt keine Wiedereinlagerungsgebühr. Siehe", returns: "Rückgabe und Erstattung",
      complete: "Vervollständige den Look", mayLike: "Das könnte dir gefallen", shopAll: "Alle ansehen", closeImage: "Bild schließen", chooseSize: "Größe wählen", fitGuide: "MIRAI Fit-Guide", availableSizes: "Verfügbare Größen",
      chest: "Brust", length: "Länge", sleeve: "Ärmel", close: "Schließen", understood: "Verstanden", precise: "Die Maße können je nach Modell variieren. Kontaktiere vor dem Kauf den Support und nenne den Code",
    },
    fr: {
      gallery: ["Vue complète", "Dos", "Détail", "Porté", "Finitions", "Vue"], newProduct: "Nouveau", defaultColor: "Multicolore", defaultFit: "Consultez le guide des tailles avant de choisir.",
      garmentCondition: "à condition que le vêtement soit intact et conserve ses étiquettes d’origine", fragranceCondition: "à condition que le produit soit intact et dans son emballage d’origine",
      delivery: "livraison estimée sous", workingDays: "jours ouvrés", sold: "Vendus ce mois-ci", firstOrder: "Première commande", withCode: "avec MIRAI10",
      tax: "TVA incluse", save: "économisez", checkoutCode: "en appliquant le code au paiement", color: "Couleur", variant: "Variante", size: "Taille", sizeGuide: "Guide des tailles",
      sizeSoldOut: "Cette taille est épuisée. Choisissez-en une autre.", selectSize: "Sélectionnez une taille avant de continuer.", available: "Disponible", availability: "Disponibilité", piece: "article", pieces: "articles",
      added: "Ajouté", add: "Ajouter au panier", soldOut: "Épuisé", productCode: "Code produit", chooseCheckout: "choisissez le mode au paiement",
      discountBeforePay: "Appliquez d’abord MIRAI10 ou un autre code promo, puis choisissez le mode de paiement.", unavailable: "Temporairement indisponible",
      freeShipping: "Livraison gratuite", always: "Toujours", easyReturn: "Retour facile", within14: "Sous 14 jours", payment: "Paiement", stripe: "Protégé par Stripe",
      details: "Détails du produit", composition: "Composition et entretien", shippingReturns: "Livraison et retours", expected: "Délai prévu", tracked: "Livraison suivie en Italie et en Europe.",
      returnText: "Les retours sont gratuits pour les commandes livrées en Italie : faites-en la demande dans les 14 jours calendaires suivant la livraison", returnEnd: "MIRAI fournit une étiquette prépayée et ne facture aucun frais de restockage. Consultez", returns: "Retours et remboursements",
      complete: "Complétez le look", mayLike: "Vous aimerez aussi", shopAll: "Tout voir", closeImage: "Fermer l’image", chooseSize: "Choisir la taille", fitGuide: "Guide de coupe MIRAI", availableSizes: "Tailles disponibles",
      chest: "Poitrine", length: "Longueur", sleeve: "Manche", close: "Fermer", understood: "Compris", precise: "Les mesures peuvent varier selon le modèle. Pour les vérifier avant l’achat, contactez le support en indiquant le code",
    },
  }[locale]
  const localizedProduct = useMemo(() => localizeProduct(product, locale), [locale, product])
  const formatPrice = (price: number) => formatLocalizedPrice(price, locale)
  const colorName = localizedProduct.colorName || productCopy.defaultColor
  const fitNote = localizedProduct.fitNote || productCopy.defaultFit
  const supplierSettings = getProductSupplierSettings(product)
  const isUnlimitedStock = supplierSettings.profile === "mirai"
  const isFragrance = ["profumi", "profumo", "fragrance", "fragrances"].includes(
    product.category.trim().toLowerCase(),
  )
  const returnCondition = isFragrance ? productCopy.fragranceCondition : productCopy.garmentCondition
  const shippingEstimate = supplierSettings.shippingMinDays !== undefined && supplierSettings.shippingMaxDays !== undefined
    ? `${productCopy.delivery} ${supplierSettings.shippingMinDays}–${supplierSettings.shippingMaxDays} ${productCopy.workingDays}`
    : `${productCopy.delivery} 3–5 ${productCopy.workingDays}`
  const detailItems = localizedProduct.detailItems
  const gallery = useMemo(() => getGalleryViews(product, productCopy.gallery), [locale, product])
  const selectedImage = gallery[selectedImageIndex] || gallery[0]
  const displayTitle = localizedProduct.name

  useEffect(() => {
    const suffix = " | MIRAI"
    document.title = `${displayTitle}${suffix}`
  }, [displayTitle])
  const firstOrderPrice = Math.round(
    Number(product.price) * (1 - FIRST_ORDER_DISCOUNT_PERCENT / 100) * 100,
  ) / 100
  const firstOrderSavings = Number(product.price) - firstOrderPrice
  const monthlySoldCount = getTestMonthlySoldCount(product.id)
  const currentVariantKey = getProductVariantKey(product)
  const variants = useMemo(
    () => [product, ...relatedProducts]
      .filter(
        (item, index, products) =>
          getProductVariantKey(item) === currentVariantKey
          && products.findIndex((candidate) => candidate.id === item.id) === index,
      )
      .sort((left, right) => {
        if (left.id === product.id) return -1
        if (right.id === product.id) return 1
        return (left.color_name || left.name).localeCompare(right.color_name || right.name, locale)
      }),
    [currentVariantKey, locale, product, relatedProducts],
  )
  const suggestedProducts = useMemo(() => {
    const nonVariants = relatedProducts.filter(
      (item) => getProductVariantKey(item) !== currentVariantKey,
    )
    return (nonVariants.length ? nonVariants : relatedProducts)
      .filter(
        (item, index, products) =>
          item.id !== product.id
          && products.findIndex((candidate) => candidate.id === item.id) === index,
      )
      .slice(0, 4)
  }, [currentVariantKey, product.id, relatedProducts])
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
      metaContentId: getCatalogItemId(product, selectedSize || "OS"),
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  function handleMobilePurchase() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    handleAddToCart()
  }

  function handleQuickPayment(paymentMethod: "paypal" | "klarna" | "scalapay") {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      return
    }
    if (selectedStock !== undefined && selectedStock <= 0) {
      setSizeError(true)
      return
    }

    setQuickPaymentLoading(paymentMethod)
    const checkoutSize = selectedSize || "OS"
    const existingCartItem = cartItems.find(
      (item) => item.productId === product.id && item.size === checkoutSize && !item.lineId,
    )

    if (existingCartItem) {
      updateQuantity(
        product.id,
        checkoutSize,
        Math.max(existingCartItem.quantity, quantity),
      )
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        size: checkoutSize,
        quantity,
        maxQuantity,
        metaContentId: getCatalogItemId(product, checkoutSize),
      })
    }

    router.push("/checkout")
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
      <MetaPixelEvent
        eventName="ViewContent"
        parameters={{
          content_ids: [getCatalogItemId(product, sizes[0] || "OS")],
          content_type: "product",
          value: Number(product.price),
          currency: "EUR",
          contents: [{
            id: getCatalogItemId(product, sizes[0] || "OS"),
            quantity: 1,
            item_price: Number(product.price),
          }],
          num_items: 1,
        }}
      />
      <PostHogCommerceEvent
        eventName="view_product"
        properties={{
          product_id: getCatalogItemId(product, sizes[0] || "OS"),
          product_name: product.name,
          category: product.category,
          brand: supplierSettings.brand,
          price: Number(product.price),
          currency: "EUR",
        }}
      />
      <nav className="mb-7 flex items-center gap-1.5 overflow-hidden text-[9px] font-medium uppercase tracking-[0.2em] text-white/50" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-white">Home</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/collezioni" className="shrink-0 hover:text-white">Shop</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/collezione/${product.category}`} className="shrink-0 hover:text-white">{translateCategory(product.category, formatCategory(product.category), locale)}</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="truncate text-white/85">{displayTitle}</span>
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
                  className="object-cover"
                  style={{ objectPosition: image.position || "center" }}
                  sizes="72px"
                />
                <span className="absolute inset-x-1 bottom-1 truncate rounded bg-black/65 px-1 py-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-white/80">
                  {image.label}
                </span>
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
                className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
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
              <span className="absolute left-4 top-4 bg-[#9f86ff] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black">{productCopy.newProduct}</span>
            )}
            {selectedImage && (
              <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
                {selectedImage.label}
              </span>
            )}
          </button>
        </section>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 flex items-center gap-2 px-1 text-base font-medium text-white/85 sm:mb-4 sm:px-2">
            <TrendingUp className="h-5 w-5 text-[#bcaeff]" />
            <span>
              {productCopy.sold}: <strong className="font-semibold text-white">{monthlySoldCount}</strong>
            </span>
          </p>

          <section className="mirai-neon-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7 lg:p-7">
          <div className="relative sm:flex sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="pr-20 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9f86ff] sm:pr-0">MIRAI LAB / {product.brand || translateCategory(product.category, formatCategory(product.category), locale)}</p>
              <h1 className="mt-5 max-w-xl text-xl font-medium leading-[1.08] tracking-[-0.035em] text-white sm:mt-3 sm:text-3xl lg:text-[2rem]">{displayTitle}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-[#9f86ff]/45 bg-[#9f86ff]/10 px-3 py-1.5 text-[10px] text-white/75">
                  <span>{productCopy.firstOrder}</span>
                  <strong className="text-xs font-semibold text-white">{formatPrice(firstOrderPrice)}</strong>
                  <span className="font-semibold text-[#bcaeff]">{productCopy.withCode}</span>
                </p>
              </div>
              <p className="mt-1 text-[10px] text-white/55">
                {productCopy.tax} · {productCopy.save} {formatPrice(firstOrderSavings)} (-{FIRST_ORDER_DISCOUNT_PERCENT}%) {productCopy.checkoutCode}
              </p>
            </div>
            <div className="absolute right-0 top-0 flex shrink-0 items-center gap-1 sm:static">
              <button type="button" onClick={shareProduct} className="flex h-10 w-10 items-center justify-center text-white/35 hover:text-white" aria-label="Condividi prodotto"><Share2 className="h-4 w-4" /></button>
              <button type="button" onClick={toggleWishlist} className={`flex h-10 w-10 items-center justify-center border transition-all ${wished ? "border-[#9f86ff] bg-[#9f86ff] text-black shadow-[0_0_24px_rgba(159,134,255,0.45)]" : "border-white/20 bg-white/[0.04] text-white/75 hover:border-primary/70 hover:text-white"}`} aria-label={wished ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}>
                <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-white/15 pt-4 sm:mt-6 sm:pt-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{productCopy.color}</p>
              <span className="text-xs text-white/65">{colorName}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label={productCopy.variant}>
              {variants.map((variant) => {
                const priceDifference = Number(variant.price) - Number(product.price)
                const isCurrent = variant.id === product.id
                return (
                  <Link
                    key={variant.id}
                    href={`/prodotto/${variant.id}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex min-w-[8.5rem] items-center gap-2 rounded-xl border px-2.5 py-2 transition-all ${
                      isCurrent
                        ? "border-[#9f86ff] bg-[#9f86ff]/15 shadow-[0_0_18px_rgba(159,134,255,0.22)]"
                        : "border-white/15 bg-white/[0.035] hover:border-[#9f86ff]/65"
                    }`}
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                      style={{
                        backgroundColor: variant.color_hex || undefined,
                        backgroundImage: !variant.color_hex && variant.image_url
                          ? `url("${variant.image_url}")`
                          : undefined,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[10px] font-medium text-white/90">
                        {localizeColor(variant.color_name, locale) || productCopy.variant}
                      </span>
                      <span className="block text-[9px] text-white/50">
                        {formatPrice(variant.price)}
                        {!isCurrent && priceDifference !== 0
                          ? ` · ${priceDifference > 0 ? "+" : "−"}${formatPrice(Math.abs(priceDifference))}`
                          : ""}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {sizes.length > 0 && (
            <div ref={purchaseRef} className="mt-5 sm:mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{productCopy.size}</p>
                <button type="button" onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1.5 text-[10px] text-white/60 underline decoration-primary/40 underline-offset-4 hover:text-white">
                  <Ruler className="h-3.5 w-3.5" /> {productCopy.sizeGuide}
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
                        aria-label={soldOut ? `Taglia ${size} esaurita` : isUnlimitedStock ? `Taglia ${size}, disponibile` : sizeStock !== undefined ? `Taglia ${size}, ${sizeStock} disponibili` : `Taglia ${size}`}
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
                    ? productCopy.sizeSoldOut
                    : productCopy.selectSize
                  : isUnlimitedStock
                    ? `${fitNote} ${productCopy.available}.`
                    : selectedStock !== undefined
                      ? `${fitNote} ${productCopy.availability}: ${selectedStock} ${selectedStock === 1 ? productCopy.piece : productCopy.pieces}.`
                      : fitNote}
              </p>
            </div>
          )}

          <div ref={sizes.length ? undefined : purchaseRef} className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="order-2 flex h-12 w-full items-center justify-center border border-white/20 bg-black/10 sm:order-1 sm:h-14 sm:w-auto">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-10 items-center justify-center text-white/45 hover:text-white" aria-label="Riduci quantità"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-8 text-center text-xs font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} className="flex h-full w-10 items-center justify-center text-white/45 hover:text-white" aria-label="Aumenta quantità"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`order-1 flex min-h-16 w-full items-center justify-center gap-2 px-5 text-xs font-bold uppercase tracking-[0.2em] transition-all sm:order-2 sm:min-h-14 sm:text-[10px] sm:tracking-[0.22em] ${added ? "bg-emerald-400 text-black" : product.in_stock ? "bg-primary text-primary-foreground shadow-[0_0_34px_rgba(159,134,255,0.46)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_42px_rgba(159,134,255,0.55)]" : "cursor-not-allowed bg-white/10 text-white/30"}`}
            >
              {added ? <><Check className="h-4 w-4" /> {productCopy.added}</> : product.in_stock ? <><ShoppingBag className="h-4 w-4" /> {productCopy.add}</> : productCopy.soldOut}
            </button>
          </div>

          {localizedProduct.description && <p className="mt-6 max-w-xl text-sm leading-6 text-white/70">{localizedProduct.description}</p>}
          {product.supplier_sku && (
            <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-white/40">
              {productCopy.productCode} {product.supplier_sku}
            </p>
          )}

          {product.in_stock && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {productCopy.chooseCheckout}
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
                {productCopy.discountBeforePay}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[10px] text-white/60">
            <PackageCheck className="h-4 w-4 text-emerald-400" />
            {product.in_stock
              ? `${productCopy.available} — ${shippingEstimate}`
              : `${productCopy.unavailable} — ${shippingEstimate}`}
          </div>

          <div className="mt-8 grid grid-cols-3 border-y border-white/15 bg-white/[0.025] py-5">
            <TrustItem icon={Truck} title={productCopy.freeShipping} detail={productCopy.always} />
            <TrustItem icon={RotateCcw} title={productCopy.easyReturn} detail={productCopy.within14} bordered />
            <TrustItem icon={ShieldCheck} title={productCopy.payment} detail={productCopy.stripe} />
          </div>

          <div className="mt-1">
            <Details title={productCopy.details} open>
              {detailItems.length > 0 ? (
                <ul className="space-y-1.5">
                  {detailItems.map((detail) => <li key={detail}>• {detail}</li>)}
                </ul>
              ) : localizedProduct.description}
            </Details>
            {(product.composition || product.care) && (
              <Details title={productCopy.composition}>
                {localizedProduct.composition && <p>{localizedProduct.composition}</p>}
                {localizedProduct.care && <p className={localizedProduct.composition ? "mt-2" : undefined}>{localizedProduct.care}</p>}
              </Details>
            )}
            <Details title={productCopy.shippingReturns}>
              {productCopy.expected}: {shippingEstimate}. {productCopy.tracked} {productCopy.returnText}, {returnCondition}. {productCopy.returnEnd} <Link href="/resi" className="text-[#9f86ff] underline underline-offset-4">{productCopy.returns}</Link>.
            </Details>
          </div>
          </section>
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <section className="mt-24 border-t border-primary/25 pt-12 md:mt-32 md:pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#9f86ff]">{productCopy.complete}</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em]">{productCopy.mayLike}</h2>
            </div>
            <Link href="/collezioni" className="hidden border-b border-white/30 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/50 hover:text-white sm:block">{productCopy.shopAll}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {suggestedProducts.map((item) => (
              <Link key={item.id} href={`/prodotto/${item.id}`} className="group min-w-0">
                <div className="mirai-neon-frame mirai-neon-lift relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-white/5">
                  {item.image_url && <Image src={item.image_url} alt={translateProductName(item.name, locale)} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" sizes="(max-width: 768px) 50vw, 25vw" />}
                </div>
                <h3 className="truncate text-xs font-medium group-hover:text-[#9f86ff]">{translateProductName(item.name, locale)}</h3>
                <p className="mt-1 text-xs text-white/45">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-[#9f86ff]/40 bg-[#100b17]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_42px_rgba(0,0,0,0.48)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p className="text-base font-semibold leading-none text-white">{formatPrice(product.price)}</p>
            <p className="mt-1 text-[9px] text-[#bcaeff]">
              {formatPrice(firstOrderPrice)} {productCopy.withCode} · -{FIRST_ORDER_DISCOUNT_PERCENT}%
            </p>
          </div>
          <button
            type="button"
            onClick={handleMobilePurchase}
            disabled={!product.in_stock}
            className={`flex min-h-[54px] min-w-0 flex-1 items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.14em] ${
              product.in_stock
                ? "bg-primary text-primary-foreground shadow-[0_0_28px_rgba(159,134,255,0.45)]"
                : "cursor-not-allowed bg-white/10 text-white/35"
            }`}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {!product.in_stock
                ? productCopy.soldOut
                : sizes.length > 0 && !selectedSize
                  ? productCopy.chooseSize
                  : added
                    ? productCopy.added
                    : productCopy.add}
            </span>
          </button>
        </div>
      </div>

      {zoomOpen && selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 md:p-10">
          <button type="button" onClick={() => setZoomOpen(false)} className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black" aria-label={productCopy.closeImage}><X className="h-5 w-5" /></button>
          <div className="relative h-full w-full max-w-6xl overflow-hidden">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              className="object-cover"
              style={{ objectPosition: selectedImage.position || "center" }}
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}

      {sizeGuideOpen && (
        <SizeGuide product={product} fitNote={fitNote} onClose={() => setSizeGuideOpen(false)} copy={productCopy} />
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

type SizeGuideCopy = {
  fitGuide: string
  sizeGuide: string
  close: string
  defaultFit: string
  size: string
  chest: string
  length: string
  sleeve: string
  availableSizes: string
  piece: string
  pieces: string
  precise: string
  understood: string
}

function SizeGuide({ product, fitNote, onClose, copy }: { product: StoreProduct; fitNote: string; onClose: () => void; copy: SizeGuideCopy }) {
  const rows = [
    ["S", "52", "69", "22"],
    ["M", "55", "71", "23"],
    ["L", "58", "73", "24"],
    ["XL", "61", "75", "25"],
  ]
  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center md:items-center md:p-6">
      <button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-label={copy.close} />
      <div className="relative w-full max-w-2xl bg-[#141416] p-6 text-white shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[9px] uppercase tracking-[0.26em] text-[#9f86ff]">{copy.fitGuide}</p><h2 className="mt-2 text-2xl font-medium">{copy.sizeGuide}</h2></div>
          <button type="button" onClick={onClose} className="p-1 text-white/40 hover:text-white" aria-label={copy.close}><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-5 text-xs leading-6 text-white/45">{fitNote || copy.defaultFit}</p>
        {product.id === "71a11e7e-5b68-4e2c-9f65-0dca2b967104" ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="border-b border-white/15 text-[9px] uppercase tracking-[0.16em] text-white/35"><tr><th className="py-3">{copy.size}</th><th className="py-3">{copy.chest}</th><th className="py-3">{copy.length}</th><th className="py-3">{copy.sleeve}</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row[0]} className="border-b border-white/10">{row.map((value) => <td key={value} className="py-4">{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{copy.availableSizes}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span key={size} className="border border-white/15 px-4 py-3 text-xs">
                  {size}{product.stock_by_size?.[size] !== undefined ? ` · ${product.stock_by_size[size]} ${product.stock_by_size[size] === 1 ? copy.piece : copy.pieces}` : ""}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[10px] leading-5 text-white/40">{copy.precise} {product.supplier_sku || product.id}.</p>
          </div>
        )}
        <button type="button" onClick={onClose} className="mt-7 w-full bg-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-[#9f86ff]">{copy.understood}</button>
      </div>
    </div>
  )
}
