"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Search, Menu, X, User, ShoppingBag, ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

type CategoryNode = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  children: CategoryNode[]
}

function DiscountMarquee({ onClose, discountText, codeText, closeLabel }: { onClose: () => void; discountText: string; codeText: string; closeLabel: string }) {
  return (
    <div className="relative border-b border-white/10 bg-[#17121f]">
      <div className="overflow-hidden py-2">
        <div className="animate-marquee-fast flex whitespace-nowrap">
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center mx-6">
                  <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-white">
                    {discountText}
                  </span>
                  <span className="mx-5 text-white/30 text-[8px]">{"\u2726"}</span>
                  <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-white">
                    {codeText}
                  </span>
                  <span className="mx-5 text-white/30 text-[8px]">{"\u2726"}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-white/40 hover:text-white transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
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
    const supabase = createClient()
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data) return
        const parents = data.filter((c) => !c.parent_id)
        const built: CategoryNode[] = parents.map((p) => ({
          ...p,
          children: data
            .filter((c) => c.parent_id === p.id)
            .map((c) => ({ ...c, children: [] })),
        }))
        setTree(built)
      })
  }, [])

  return tree
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileCollezioni, setMobileCollezioni] = useState(false)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { itemCount } = useCart()
  const { t } = useLanguage()
  const categories = useCategories()

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          setIsLoggedIn(!!user)
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

  const accountHref = isLoggedIn ? "/account" : "/auth/login"

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {showBanner && (
        <DiscountMarquee 
          onClose={() => setShowBanner(false)} 
          discountText={t.nav.discountBanner}
          codeText={t.nav.discountCode}
          closeLabel={t.nav.closeBanner}
        />
      )}
      <nav className="border-b border-white/10 bg-[#0c0c0d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <span
                className="text-xl font-bold tracking-[0.25em] uppercase text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {"MIR\u039BI"}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/#prodotti"
                className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              >
                {t.nav.newArrivals}
              </Link>

              {/* Collezioni dropdown */}
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href="/collezioni"
                  className="flex items-center gap-1 text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
                >
                  {t.nav.collections}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </Link>

                {dropdownOpen && categories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                    <div className="min-w-[480px] rounded-lg border border-white/10 bg-[#151517] p-5 shadow-2xl">
                      <div className="grid grid-cols-2 gap-6">
                        {categories.map((parent) => (
                          <div key={parent.id}>
                            <Link
                              href={`/collezione/${parent.slug}`}
                              className="mb-2.5 block text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-primary transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {parent.name}
                            </Link>
                            {parent.children.length > 0 && (
                              <div className="flex flex-col gap-1">
                                {parent.children.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/collezione/${parent.slug}?sub=${sub.slug}`}
                                    className="text-sm text-white/45 hover:pl-1 hover:text-white transition-all duration-200"
                                    onClick={() => setDropdownOpen(false)}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <Link
                          href="/collezioni"
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
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/collezioni#shop-search"
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
              className="text-white lg:hidden"
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
        <div className="border-t border-white/10 bg-[#111113] lg:hidden">
          <div className="flex flex-col px-6 py-6 gap-4">
            <Link
              href="/#prodotti"
              className="text-sm tracking-widest uppercase text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.newArrivals}
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
                        href={`/collezione/${parent.slug}`}
                        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {parent.name}
                      </Link>
                      {parent.children.length > 0 && (
                        <div className="ml-3 flex flex-col gap-1">
                          {parent.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/collezione/${parent.slug}?sub=${sub.slug}`}
                              className="text-sm text-white/45 hover:text-white transition-colors"
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub.name}
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
  )
}
