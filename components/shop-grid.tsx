"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  Grid2X2,
  Grid3X3,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { StoreProduct } from "@/lib/products"
import { useLanguage } from "@/lib/language-context"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
}

type SortKey = "newest" | "price-asc" | "price-desc" | "name"
type Availability = "all" | "available" | "sold-out"

const sortCopy: Record<string, Record<SortKey, string>> = {
  it: { newest: "Più recenti", "price-asc": "Prezzo crescente", "price-desc": "Prezzo decrescente", name: "Nome A–Z" },
  en: { newest: "Newest", "price-asc": "Price: low to high", "price-desc": "Price: high to low", name: "Name A–Z" },
  es: { newest: "Más recientes", "price-asc": "Precio ascendente", "price-desc": "Precio descendente", name: "Nombre A–Z" },
  de: { newest: "Neueste", "price-asc": "Preis aufsteigend", "price-desc": "Preis absteigend", name: "Name A–Z" },
  fr: { newest: "Plus récents", "price-asc": "Prix croissant", "price-desc": "Prix décroissant", name: "Nom A–Z" },
}

const shopCopy = {
  it: {
    eyebrow: "Collezione 01 / Tutto lo shop",
    title: "Lo shop",
    pieces: "Capi",
    categories: "Categorie",
    collection: "Collezione",
    search: "Cerca nello shop",
    noMatch: "Nessun prodotto trovato.",
    newProduct: "Nuovo",
    soldOut: "Esaurito",
    quickAdd: "Aggiunta rapida",
    selectSize: "Seleziona taglia",
    productDetails: "Dettagli prodotto",
    addToCart: "Aggiungi al carrello",
  },
  en: {
    eyebrow: "Collection 01 / Shop all",
    title: "The shop",
    pieces: "Pieces",
    categories: "Categories",
    collection: "Collection",
    search: "Search the shop",
    noMatch: "No products found.",
    newProduct: "New",
    soldOut: "Sold out",
    quickAdd: "Quick add",
    selectSize: "Select size",
    productDetails: "Product details",
    addToCart: "Add to cart",
  },
  es: {
    eyebrow: "Colección 01 / Ver todo",
    title: "La tienda",
    pieces: "Prendas",
    categories: "Categorías",
    collection: "Colección",
    search: "Buscar en la tienda",
    noMatch: "No se encontraron productos.",
    newProduct: "Nuevo",
    soldOut: "Agotado",
    quickAdd: "Añadir rápido",
    selectSize: "Selecciona talla",
    productDetails: "Detalles del producto",
    addToCart: "Añadir al carrito",
  },
  de: {
    eyebrow: "Kollektion 01 / Alles ansehen",
    title: "Der Shop",
    pieces: "Teile",
    categories: "Kategorien",
    collection: "Kollektion",
    search: "Im Shop suchen",
    noMatch: "Keine Produkte gefunden.",
    newProduct: "Neu",
    soldOut: "Ausverkauft",
    quickAdd: "Schnell hinzufügen",
    selectSize: "Größe wählen",
    productDetails: "Produktdetails",
    addToCart: "In den Warenkorb",
  },
  fr: {
    eyebrow: "Collection 01 / Tout voir",
    title: "La boutique",
    pieces: "Pièces",
    categories: "Catégories",
    collection: "Collection",
    search: "Rechercher dans la boutique",
    noMatch: "Aucun produit trouvé.",
    newProduct: "Nouveau",
    soldOut: "Épuisé",
    quickAdd: "Ajout rapide",
    selectSize: "Choisir la taille",
    productDetails: "Détails du produit",
    addToCart: "Ajouter au panier",
  },
} as const

function formatCategory(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price))
}

function isSizeAvailable(product: StoreProduct, size: string) {
  const quantity = product.stock_by_size?.[size]
  return quantity === undefined || Number(quantity) > 0
}

export function ShopGrid({
  products,
  parentCategories,
  subcategories,
}: {
  products: StoreProduct[]
  parentCategories: Category[]
  subcategories: Category[]
}) {
  const { addItem } = useCart()
  const { locale } = useLanguage()
  const labels = shopCopy[locale]
  const sortLabels = sortCopy[locale]
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [availability, setAvailability] = useState<Availability>("all")
  const [sort, setSort] = useState<SortKey>("newest")
  const [maxPrice, setMaxPrice] = useState(() =>
    Math.ceil(Math.max(100, ...products.map((product) => Number(product.price))) / 10) * 10
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [columns, setColumns] = useState<3 | 4>(4)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [quickAddProduct, setQuickAddProduct] = useState<StoreProduct | null>(null)
  const [quickAddSize, setQuickAddSize] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mirai-wishlist")
      if (saved) setWishlist(JSON.parse(saved))
    } catch {
      // A private browser session can block local storage.
    }
  }, [])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    document.body.style.overflow = filtersOpen || quickAddProduct ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [filtersOpen, quickAddProduct])

  const categoryLabels = useMemo(() => {
    const labels = new Map(subcategories.map((category) => [category.slug, category.name]))
    parentCategories.forEach((category) => labels.set(category.slug, category.name))
    return labels
  }, [parentCategories, subcategories])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) || 0) + 1)
    })
    return [...counts.entries()]
      .map(([slug, count]) => ({
        slug,
        name: categoryLabels.get(slug) || formatCategory(slug),
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "it"))
  }, [categoryLabels, products])

  const sizes = useMemo(
    () =>
      [...new Set(products.flatMap((product) => product.sizes || []))].sort(
        (a, b) => ["XS", "S", "M", "L", "XL", "XXL", "OS"].indexOf(a) - ["XS", "S", "M", "L", "XL", "XXL", "OS"].indexOf(b)
      ),
    [products]
  )

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("it")
    const result = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.description || ""} ${product.category}`
          .toLocaleLowerCase("it")
          .includes(normalizedQuery)
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesSize =
        selectedSizes.length === 0 || selectedSizes.some(
          (size) => product.sizes?.includes(size) && isSizeAvailable(product, size),
        )
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && product.in_stock) ||
        (availability === "sold-out" && !product.in_stock)
      return matchesQuery && matchesCategory && matchesSize && matchesAvailability && Number(product.price) <= maxPrice
    })

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price)
      if (sort === "price-desc") return Number(b.price) - Number(a.price)
      if (sort === "name") return a.name.localeCompare(b.name, "it")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [availability, maxPrice, products, query, selectedCategories, selectedSizes, sort])

  const catalogMaxPrice = useMemo(
    () => Math.ceil(Math.max(100, ...products.map((product) => Number(product.price))) / 10) * 10,
    [products]
  )

  const activeFilterCount =
    selectedCategories.length + selectedSizes.length + (availability === "all" ? 0 : 1) + (maxPrice < catalogMaxPrice ? 1 : 0)

  function toggleWishlist(id: string) {
    setWishlist((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      try {
        window.localStorage.setItem("mirai-wishlist", JSON.stringify(next))
      } catch {
        // Keep the in-memory experience working when persistence is unavailable.
      }
      return next
    })
  }

  function toggleFilter(value: string, selected: string[], setSelected: (next: string[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  function clearFilters() {
    setQuery("")
    setSelectedCategories([])
    setSelectedSizes([])
    setAvailability("all")
    setMaxPrice(catalogMaxPrice)
  }

  function openQuickAdd(product: StoreProduct) {
    if (!product.in_stock) return
    const availableSizes = (product.sizes || []).filter((size) => isSizeAvailable(product, size))
    if (availableSizes.length === 0) return
    if (availableSizes.length <= 1) {
      addProduct(product, availableSizes[0] || "OS")
      return
    }
    setQuickAddProduct(product)
    setQuickAddSize(null)
  }

  function addProduct(product: StoreProduct, size: string) {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      size,
      maxQuantity: product.stock_by_size?.[size],
    })
    setQuickAddProduct(null)
    setQuickAddSize(null)
    setNotice(`${product.name} · ${size} aggiunta al carrello`)
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-28 text-foreground md:pt-32">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[110px]" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-8 md:py-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {labels.eyebrow}
              </div>
              <h1 className="text-[clamp(1.75rem,3vw,2.75rem)] font-semibold uppercase leading-none tracking-[-0.03em] text-foreground">
                {labels.title}
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 md:text-base">
                Silhouette oversize, grafiche decise e dettagli custom. Ogni capo MIRAI nasce per vivere la strada, non per seguire una stagione.
              </p>
            </div>
            <div className="grid grid-cols-3 border-y border-white/10 py-5 text-center lg:min-w-[390px]">
              <div className="border-r border-white/10 px-4">
                <p className="text-2xl font-medium">{products.length}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/40">{labels.pieces}</p>
              </div>
              <div className="border-r border-white/10 px-4">
                <p className="text-2xl font-medium">{categories.length}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/40">{labels.categories}</p>
              </div>
              <div className="px-4">
                <p className="text-2xl font-medium">01</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/40">{labels.collection}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[95px] z-30 border-b border-white/10 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:px-8">
          <div className="relative min-w-0 flex-1 md:max-w-md">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              ref={searchInput}
              id="shop-search"
              type="search"
              aria-label="Cerca prodotti"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
              className="h-11 w-full border-0 border-b border-white/15 bg-transparent pl-7 pr-8 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                aria-label="Cancella ricerca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Apri filtri"
            className="relative flex h-11 items-center gap-2 border border-white/15 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-white/40"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtri</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((open) => !open)}
              aria-label={`Ordina: ${sortLabels[sort]}`}
              className="flex h-11 items-center gap-2 border border-white/15 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-white/40"
              aria-expanded={sortOpen}
            >
              <ArrowDownUp className="h-4 w-4" />
              <span className="hidden md:inline">{sortLabels[sort]}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-56 border border-white/10 bg-card p-1.5 shadow-2xl">
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key)
                      setSortOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors ${sort === key ? "bg-white text-black" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    {sortLabels[key]}
                    {sort === key && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center border border-white/15 lg:flex">
            <button
              type="button"
              onClick={() => setColumns(3)}
              className={`p-3 transition-colors ${columns === 3 ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              aria-label="Mostra tre prodotti per riga"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setColumns(4)}
              className={`p-3 transition-colors ${columns === 4 ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              aria-label="Mostra quattro prodotti per riga"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
            {filteredProducts.length} {filteredProducts.length === 1 ? "prodotto" : "prodotti"}
          </p>
          {(activeFilterCount > 0 || query) && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedCategories.map((slug) => (
                <FilterChip key={slug} label={categoryLabels.get(slug) || formatCategory(slug)} onRemove={() => toggleFilter(slug, selectedCategories, setSelectedCategories)} />
              ))}
              {selectedSizes.map((size) => (
                <FilterChip key={size} label={`Taglia ${size}`} onRemove={() => toggleFilter(size, selectedSizes, setSelectedSizes)} />
              ))}
              <button type="button" onClick={clearFilters} className="px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary hover:text-white">
                Azzera tutto
              </button>
            </div>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className={`grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                categoryName={categoryLabels.get(product.category) || formatCategory(product.category)}
                wished={wishlist.includes(product.id)}
                onWishlist={() => toggleWishlist(product.id)}
                onQuickAdd={() => openQuickAdd(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[440px] flex-col items-center justify-center border border-dashed border-white/15 px-6 text-center">
            <Search className="mb-6 h-10 w-10 text-white/20" />
            <h2 className="text-2xl font-medium">{labels.noMatch}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
              Prova un’altra ricerca o rimuovi uno dei filtri attivi.
            </p>
            <button type="button" onClick={clearFilters} className="mt-7 border-b border-primary pb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
              Mostra tutto
            </button>
          </div>
        )}
      </main>

      {filtersOpen && (
        <FilterDrawer
          categories={categories}
          selectedCategories={selectedCategories}
          onCategory={(slug) => toggleFilter(slug, selectedCategories, setSelectedCategories)}
          sizes={sizes}
          selectedSizes={selectedSizes}
          onSize={(size) => toggleFilter(size, selectedSizes, setSelectedSizes)}
          availability={availability}
          onAvailability={setAvailability}
          maxPrice={maxPrice}
          catalogMaxPrice={catalogMaxPrice}
          onMaxPrice={setMaxPrice}
          resultCount={filteredProducts.length}
          onReset={clearFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {quickAddProduct && (
        <QuickAdd
          product={quickAddProduct}
          selectedSize={quickAddSize}
          onSize={setQuickAddSize}
          onClose={() => setQuickAddProduct(null)}
          onAdd={() => quickAddSize && addProduct(quickAddProduct, quickAddSize)}
        />
      )}

      <div
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 bg-white px-5 py-3 text-xs font-medium text-black shadow-2xl transition-all duration-300 ${notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><Check className="h-3.5 w-3.5" /></span>
        {notice}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  index,
  categoryName,
  wished,
  onWishlist,
  onQuickAdd,
}: {
  product: StoreProduct
  index: number
  categoryName: string
  wished: boolean
  onWishlist: () => void
  onQuickAdd: () => void
}) {
  const { locale } = useLanguage()
  const labels = shopCopy[locale]

  return (
    <article className="group min-w-0" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-card">
        <Link href={`/prodotto/${product.id}`} className="absolute inset-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center"><ShoppingBag className="h-12 w-12 text-white/10" /></div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
          <div className="flex flex-col items-start gap-1.5">
            {product.is_new && <span className="bg-primary px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-primary-foreground">{labels.newProduct}</span>}
            {!product.in_stock && <span className="bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-black">{labels.soldOut}</span>}
          </div>
          <button
            type="button"
            onClick={onWishlist}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
            aria-label={wished ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
          </button>
        </div>
        {product.in_stock && (
          <div className="absolute inset-x-0 bottom-0 p-3 md:translate-y-full md:transition-transform md:duration-300 md:group-hover:translate-y-0">
            <button
              type="button"
              onClick={onQuickAdd}
              className="flex w-full items-center justify-center gap-2 bg-white px-3 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-black transition-colors hover:bg-primary hover:text-primary-foreground md:py-3.5 md:text-[10px]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {labels.quickAdd}
            </button>
          </div>
        )}
      </div>
      <Link href={`/prodotto/${product.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.25em] text-primary md:text-[9px]">{categoryName}</p>
            <h2 className="truncate text-xs font-medium text-white transition-colors group-hover:text-primary md:text-sm">{product.name}</h2>
          </div>
          <p className="shrink-0 text-xs font-medium text-white md:text-sm">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-2 hidden text-[10px] text-white/35 sm:block">{product.sizes?.join(" · ") || "Taglia unica"}</p>
      </Link>
    </article>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/65 hover:border-white/40 hover:text-white">
      {label} <X className="h-3 w-3" />
    </button>
  )
}

function FilterDrawer({
  categories,
  selectedCategories,
  onCategory,
  sizes,
  selectedSizes,
  onSize,
  availability,
  onAvailability,
  maxPrice,
  catalogMaxPrice,
  onMaxPrice,
  resultCount,
  onReset,
  onClose,
}: {
  categories: { slug: string; name: string; count: number }[]
  selectedCategories: string[]
  onCategory: (slug: string) => void
  sizes: string[]
  selectedSizes: string[]
  onSize: (size: string) => void
  availability: Availability
  onAvailability: (availability: Availability) => void
  maxPrice: number
  catalogMaxPrice: number
  onMaxPrice: (price: number) => void
  resultCount: number
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Chiudi filtri" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-card text-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-primary">Refine your selection</p>
            <h2 className="mt-1 text-xl font-medium">Filtri</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-white/50 hover:text-white" aria-label="Chiudi filtri"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <FilterSection title="Categoria">
            <div className="space-y-1">
              {categories.map((category) => (
                <label key={category.slug} className="flex cursor-pointer items-center justify-between py-2 text-sm text-white/60 hover:text-white">
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => onCategory(category.slug)}
                      className="h-4 w-4 accent-primary"
                    />
                    {category.name}
                  </span>
                  <span className="text-[10px] text-white/30">{category.count}</span>
                </label>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Taglia">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSize(size)}
                  className={`min-w-12 border px-3 py-2.5 text-xs transition-colors ${selectedSizes.includes(size) ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Disponibilità">
            <div className="grid grid-cols-3 gap-2">
              {(["all", "available", "sold-out"] as Availability[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onAvailability(value)}
                  className={`border px-2 py-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${availability === value ? "border-white bg-white text-black" : "border-white/15 text-white/50 hover:text-white"}`}
                >
                  {value === "all" ? "Tutti" : value === "available" ? "Disponibili" : "Esauriti"}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection title="Prezzo massimo">
            <div className="flex items-center justify-between text-sm"><span className="text-white/45">Fino a</span><span>{formatPrice(maxPrice)}</span></div>
            <input
              type="range"
              min="0"
              max={catalogMaxPrice}
              step="5"
              value={maxPrice}
              onChange={(event) => onMaxPrice(Number(event.target.value))}
              className="mt-5 w-full accent-primary"
              aria-label="Prezzo massimo"
            />
          </FilterSection>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-white/10 p-5">
          <button type="button" onClick={onReset} className="px-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45 hover:text-white">Azzera</button>
          <button type="button" onClick={onClose} className="bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-primary hover:text-primary-foreground">Mostra {resultCount} prodotti</button>
        </div>
      </aside>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/10 py-6">
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">{title}</h3>
      {children}
    </section>
  )
}

function QuickAdd({
  product,
  selectedSize,
  onSize,
  onClose,
  onAdd,
}: {
  product: StoreProduct
  selectedSize: string | null
  onSize: (size: string) => void
  onClose: () => void
  onAdd: () => void
}) {
  const { locale } = useLanguage()
  const labels = shopCopy[locale]

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center md:items-center">
      <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="Chiudi quick add" />
      <div className="relative w-full max-w-xl border border-white/10 bg-card p-5 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300 md:p-7">
        <div className="flex gap-4">
          <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-white/5">
            {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="96px" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-primary">{labels.quickAdd}</p>
                <h2 className="mt-1 text-lg font-medium">{product.name}</h2>
                <p className="mt-1 text-sm text-white/55">{formatPrice(product.price)}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 text-white/40 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{labels.selectSize}</p>
          <Link href={`/prodotto/${product.id}`} className="text-[9px] uppercase tracking-[0.18em] text-white/45 underline underline-offset-4 hover:text-white">{labels.productDetails}</Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {product.sizes.map((size) => {
            const unavailable = !isSizeAvailable(product, size)
            return (
              <button
                key={size}
                type="button"
                disabled={unavailable}
                onClick={() => onSize(size)}
                className={`border py-3 text-xs transition-colors ${
                  unavailable
                    ? "cursor-not-allowed border-white/10 text-white/20 line-through"
                    : selectedSize === size
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          disabled={!selectedSize}
          onClick={onAdd}
          className="mt-5 flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
        >
          <ShoppingBag className="h-4 w-4" />
          {labels.addToCart}
        </button>
      </div>
    </div>
  )
}
