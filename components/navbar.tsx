"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Disc3, Search, Menu, X, User, ShoppingBag, ChevronDown, ChevronRight, UsersRound, WandSparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { localizedOrganicPath } from "@/lib/international-seo"
import { translateCategory } from "@/lib/site-localization"
import { stylizeBrandText } from "@/lib/brand"
import { BrandMark } from "@/components/brand-mark"

type CategoryNode = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  children: CategoryNode[]
}

const PERFUME_CATEGORY_PATTERN = /profum|parfum|fragrance/i
const CATEGORY_CACHE_KEY = "mirai-navbar-categories-v1"
const CATEGORY_CACHE_TTL_MS = 15 * 60 * 1000

function isPerfumeCategory(category: Pick<CategoryNode, "name" | "slug">) {
  return PERFUME_CATEGORY_PATTERN.test(`${category.name} ${category.slug}`)
}

const CartSidebar = dynamic(
  () => import("@/components/cart-sidebar").then((m) => m.CartSidebar),
  {
    ssr: false,
    loading: () => (
      <button aria-label="Carrello" className="relative text-white/55">
        <ShoppingBag className="h-5 w-5" />
      </button>
    ),
  }
)

function useCategories() {
  const [tree, setTree] = useState<CategoryNode[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    try {
      const cached = JSON.parse(window.sessionStorage.getItem(CATEGORY_CACHE_KEY) || "null")
      if (
        cached
        && Array.isArray(cached.tree)
        && typeof cached.savedAt === "number"
        && Date.now() - cached.savedAt < CATEGORY_CACHE_TTL_MS
      ) {
        setTree(cached.tree)
        return
      }
    } catch {
      // Fall through to the live catalog query if session storage is unavailable.
    }

    const supabase = createClient()
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data) return
        const rows = data as Array<Omit<CategoryNode, "children"> & { sort_order?: number }>
        const parents = rows.filter((c) => !c.parent_id)
        const built: CategoryNode[] = parents.map((p) => {
          const children = rows
            .filter((c) => c.parent_id === p.id)
            .map((c) => ({ ...c, children: [] }))
          const perfumeChild = children.find(isPerfumeCategory)

          // "Mirai parfum exlusive" is only the DB container for the actual
          // "Profumi" category. The child can be hidden by category RLS in
          // anonymous sessions, so always expose the canonical public route.
          if (isPerfumeCategory(p)) {
            return {
              ...(perfumeChild ?? p),
              name: "Profumi",
              slug: "profumi",
              parent_id: null,
              children: [],
            }
          }

          return { ...p, children }
        })
        const seen = new Set<string>()
        const nextTree = built.filter((category) => {
            const key = isPerfumeCategory(category) ? "profumi" : category.slug.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        setTree(nextTree)
        try {
          window.sessionStorage.setItem(
            CATEGORY_CACHE_KEY,
            JSON.stringify({ tree: nextTree, savedAt: Date.now() }),
          )
        } catch {
          // The navigation remains fully functional without session storage.
        }
      })
  }, [])

  return tree
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileCollezioni, setMobileCollezioni] = useState(false)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { itemCount } = useCart()
  const { t, locale } = useLanguage()
  const storeLabel = {
    it: "Negozio",
    en: "Store",
    es: "Tienda",
    de: "Store",
    fr: "Boutique",
  }[locale]
  const beatsLabel = {
    it: "I Nostri Beat",
    en: "Our Beats",
    es: "Nuestros Beats",
    de: "Unsere Beats",
    fr: "Nos Beats",
  }[locale]
  const communityLabel = {
    it: "Community",
    en: "Community",
    es: "Comunidad",
    de: "Community",
    fr: "Communaute",
  }[locale]
  const categories = useCategories()
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setIsLoggedIn(!!session?.user)
        })
        .catch(() => {})

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session?.user)
      })

      return () => subscription.unsubscribe()
    } catch {
      // Supabase not available
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle("mirai-mobile-menu-open", mobileOpen)

    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.classList.remove("mirai-mobile-menu-open")
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  const accountHref = isLoggedIn ? "/account" : "/auth/login"

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mirai-neon-divider bg-[#0c0c0d]/88 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href={localizedOrganicPath("/", locale)} className="flex items-center shrink-0">
              <BrandMark className="text-xl text-white" />
            </Link>

            <div className="hidden items-center gap-5 whitespace-nowrap 2xl:flex">
              <Link
                href={localizedOrganicPath("/collezioni", locale)}
                className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(168,85,247,0.25)]"
              >
                {t.nav.shop}
              </Link>
              <Link
                href="/custom-lab"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-primary/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-all hover:border-primary hover:bg-primary/15 hover:text-white hover:shadow-[0_0_24px_rgba(159,134,255,0.2)]"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                MirΛi Custom Lab
              </Link>
              <Link
                href="/i-nostri-beat"
                className="inline-flex items-center gap-1.5 text-sm tracking-widest uppercase text-white/55 transition-colors hover:text-white"
              >
                <Disc3 className="h-3.5 w-3.5" />
                {beatsLabel}
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 text-sm tracking-widest uppercase text-white/55 transition-colors hover:text-white"
              >
                <UsersRound className="h-3.5 w-3.5" />
                {communityLabel}
              </Link>
              <Link
                href={localizedOrganicPath("/#prodotti", locale)}
                className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              >
                {t.nav.newArrivals}
              </Link>
              <Link
                href={localizedOrganicPath("/collezione/drop", locale)}
                className="text-sm font-semibold tracking-widest uppercase text-primary hover:text-white transition-colors"
              >
                Drop
              </Link>

              {/* Collezioni dropdown */}
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={localizedOrganicPath("/collezioni", locale)}
                  className="flex items-center gap-1 text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
                >
                  {t.nav.collections}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </Link>

                {dropdownOpen && categories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                    <div className="mirai-neon-card min-w-[480px] rounded-2xl p-5">
                      <div className="grid grid-cols-2 gap-6">
                        {categories.map((parent) => (
                          <div key={parent.id}>
                            <Link
                              href={localizedOrganicPath(`/collezione/${parent.slug}`, locale)}
                              className="mb-2.5 block text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-primary transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {stylizeBrandText(translateCategory(parent.slug, parent.name, locale))}
                            </Link>
                            {parent.children.length > 0 && (
                              <div className="flex flex-col gap-1">
                                {parent.children.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={localizedOrganicPath(`/collezione/${parent.slug}?sub=${sub.slug}`, locale)}
                                    className="text-sm text-white/45 hover:pl-1 hover:text-white transition-all duration-200"
                                    onClick={() => setDropdownOpen(false)}
                                  >
                                    {stylizeBrandText(translateCategory(sub.slug, sub.name, locale))}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <Link
                          href={localizedOrganicPath("/collezioni", locale)}
                          className="text-xs tracking-widest uppercase text-primary hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {t.nav.viewAllCollections}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/chi-siamo"
                className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              >
                {t.nav.aboutUs}
              </Link>
              <Link
                href="/negozio"
                className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              >
                {storeLabel}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href={localizedOrganicPath("/collezioni#shop-search", locale)}
              aria-label={t.nav.search}
              className="text-white/55 hover:text-white transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href={accountHref}
              aria-label={t.nav.account}
              className="text-white/55 hover:text-white transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
            <LanguageSwitcher />
            <CartSidebar />
            <button
              className="text-white 2xl:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="max-h-[calc(100dvh-4rem)] touch-pan-y overflow-y-auto overscroll-contain border-t border-white/10 bg-[#111113] [-webkit-overflow-scrolling:touch] 2xl:hidden">
          <div className="flex flex-col gap-4 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6">
            <Link
              href={localizedOrganicPath("/collezioni", locale)}
              className="flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.shop}
            </Link>
            <Link
              href="/custom-lab"
              className="flex items-center justify-center gap-2 rounded-sm border border-primary/45 bg-primary/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary"
              onClick={() => setMobileOpen(false)}
            >
              <WandSparkles className="h-4 w-4" /> MirΛi Custom Lab
            </Link>
            <Link
              href="/i-nostri-beat"
              className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70"
              onClick={() => setMobileOpen(false)}
            >
              <Disc3 className="h-4 w-4" /> {beatsLabel}
            </Link>
            <Link
              href="/community"
              className="flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70"
              onClick={() => setMobileOpen(false)}
            >
              <UsersRound className="h-4 w-4" /> {communityLabel}
            </Link>
            <Link
              href={localizedOrganicPath("/#prodotti", locale)}
              className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.newArrivals}
            </Link>
            <Link
              href={localizedOrganicPath("/collezione/drop", locale)}
              className="text-sm font-semibold tracking-widest uppercase text-primary hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Drop
            </Link>

            {/* Mobile Collezioni accordion */}
            <div>
              <button
                className="flex w-full items-center justify-between text-sm uppercase tracking-widest text-white/55 hover:text-white transition-colors"
                onClick={() => setMobileCollezioni(!mobileCollezioni)}
              >
                {t.nav.collections}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${mobileCollezioni ? "rotate-180" : ""}`}
                />
              </button>
              {mobileCollezioni && categories.length > 0 && (
                <div className="mt-3 ml-2 flex flex-col gap-3">
                  {categories.map((parent) => (
                    <div key={parent.id}>
                      <Link
                        href={localizedOrganicPath(`/collezione/${parent.slug}`, locale)}
                        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {stylizeBrandText(translateCategory(parent.slug, parent.name, locale))}
                      </Link>
                      {parent.children.length > 0 && (
                        <div className="ml-3 flex flex-col gap-1">
                          {parent.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={localizedOrganicPath(`/collezione/${parent.slug}?sub=${sub.slug}`, locale)}
                              className="text-sm text-white/45 hover:text-white transition-colors"
                              onClick={() => setMobileOpen(false)}
                            >
                              {translateCategory(sub.slug, sub.name, locale)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/chi-siamo"
              className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.aboutUs}
            </Link>
            <Link
              href="/negozio"
              className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {storeLabel}
            </Link>
            <Link
              href={accountHref}
              className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.account}
            </Link>
          </div>
          </div>
        )}
      </header>
    </>
  )
}
