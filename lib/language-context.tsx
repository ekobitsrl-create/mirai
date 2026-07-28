"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, translations, Translations } from "./translations"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("it")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      window.localStorage.setItem("mirai-locale", newLocale)
    } catch {
      // Keep the selected language for the current session when storage is blocked.
    }
    // Update HTML lang attribute
    document.documentElement.lang = newLocale
  }

  const t = translations[locale]

  // Prevent hydration mismatch by using default locale on server
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: "it", setLocale, t: translations.it }}>
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
