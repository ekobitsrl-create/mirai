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
    // Get saved locale from localStorage or browser preference
    const savedLocale = localStorage.getItem("mirai-locale") as Locale | null
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
    localStorage.setItem("mirai-locale", newLocale)
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
