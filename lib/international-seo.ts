import type { Locale } from "@/lib/translations"
import { getAbsoluteUrl } from "@/lib/site-url"

export const ORGANIC_LOCALES: Locale[] = ["it", "en", "es", "de", "fr"]
export const PREFIXED_ORGANIC_LOCALES: Exclude<Locale, "it">[] = ["en", "es", "de", "fr"]

export const HTML_LOCALES: Record<Locale, string> = {
  it: "it-IT",
  en: "en",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
}

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  it: "it_IT",
  en: "en_GB",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
}

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && ORGANIC_LOCALES.includes(value as Locale))
}

export function isPrefixedOrganicLocale(
  value: string | null | undefined,
): value is Exclude<Locale, "it"> {
  return Boolean(value && PREFIXED_ORGANIC_LOCALES.includes(value as Exclude<Locale, "it">))
}

function splitPathSuffix(value: string) {
  const match = value.match(/^([^?#]*)(.*)$/)
  return { pathname: match?.[1] || "/", suffix: match?.[2] || "" }
}

export function stripOrganicLocale(path: string) {
  const { pathname, suffix } = splitPathSuffix(path)
  const segments = pathname.split("/")
  if (isPrefixedOrganicLocale(segments[1])) segments.splice(1, 1)
  const normalized = `/${segments.filter(Boolean).join("/")}` || "/"
  return `${normalized}${suffix}`
}

export function supportsLocalizedOrganicPath(path: string) {
  const { pathname } = splitPathSuffix(stripOrganicLocale(path))
  return (
    pathname === "/" ||
    pathname === "/collezioni" ||
    pathname === "/guide" ||
    pathname.startsWith("/collezione/") ||
    pathname.startsWith("/prodotto/") ||
    pathname.startsWith("/guide/")
  )
}

export function localizedOrganicPath(path: string, locale: Locale) {
  if (!path || path.startsWith("#") || /^(?:https?:|mailto:|tel:)/i.test(path)) return path

  const stripped = stripOrganicLocale(path)
  if (!supportsLocalizedOrganicPath(stripped) || locale === "it") return stripped

  const { pathname, suffix } = splitPathSuffix(stripped)
  const localizedPathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`
  return `${localizedPathname}${suffix}`
}

export function getOrganicLanguageAlternates(path: string) {
  const basePath = stripOrganicLocale(path)
  const italianUrl = getAbsoluteUrl(localizedOrganicPath(basePath, "it"))
  const englishUrl = getAbsoluteUrl(localizedOrganicPath(basePath, "en"))
  const spanishUrl = getAbsoluteUrl(localizedOrganicPath(basePath, "es"))
  const germanUrl = getAbsoluteUrl(localizedOrganicPath(basePath, "de"))
  const frenchUrl = getAbsoluteUrl(localizedOrganicPath(basePath, "fr"))

  return {
    it: italianUrl,
    "it-IT": italianUrl,
    en: englishUrl,
    "en-IE": englishUrl,
    "en-MT": englishUrl,
    es: spanishUrl,
    "es-ES": spanishUrl,
    de: germanUrl,
    "de-DE": germanUrl,
    "de-AT": germanUrl,
    fr: frenchUrl,
    "fr-FR": frenchUrl,
    "fr-BE": frenchUrl,
    "fr-LU": frenchUrl,
    "x-default": italianUrl,
  }
}
