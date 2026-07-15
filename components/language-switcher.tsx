"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Locale, localeNames, localeFlags } from "@/lib/translations"

const locales: Locale[] = ["it", "en", "es", "de", "fr"]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t.common.language}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[#6b5f7d] hover:text-[#1a1025] transition-colors"
      >
        <Globe className="h-5 w-5" />
        <span className="hidden sm:inline text-xs uppercase tracking-wider font-medium">
          {locale.toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-white border border-[#e4e0ec] rounded-lg shadow-xl min-w-[160px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === loc
                  ? "bg-[#f0ecf7] text-[#1a1025] font-medium"
                  : "text-[#6b5f7d] hover:bg-[#f8f6fb] hover:text-[#1a1025]"
              }`}
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span className="flex-1 text-left">{localeNames[loc]}</span>
              {locale === loc && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
