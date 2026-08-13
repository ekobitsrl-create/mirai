"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, translations, Translations } from "./translations"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLocale = "it",
  detectBrowserLanguage = true,
}: {
  children: ReactNode
  initialLocale?: Locale
  detectBrowserLanguage?: boolean
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!detectBrowserLanguage) {
      setLocaleState(initialLocale)
      try {
        window.localStorage.setItem("mirai-locale", initialLocale)
      } catch {
        // The URL still provides a stable language when storage is unavailable.
      }
      return
    }

    let savedLocale: Locale | null = null

    try {
      savedLocale = window.localStorage.getItem("mirai-locale") as Locale | null
    } catch {
      // Privacy settings can disable browser storage. Language detection still works.
    }

    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Locale
      if (translations[browserLang]) {
        setLocaleState(browserLang)
      }
    }
  }, [detectBrowserLanguage, initialLocale])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      window.localStorage.setItem("mirai-locale", newLocale)
    } catch {
      // Keep the selected language for the current session when storage is blocked.
    }
  }

  const t = translations[locale]

  // Keep server rendering deterministic while allowing locale-prefixed pages
  // to emit translated HTML on their first response.
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: initialLocale, setLocale, t: translations[initialLocale] }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
