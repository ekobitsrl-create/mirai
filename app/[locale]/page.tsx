import type { Metadata } from "next"
import HomePage from "@/app/page"
import { buildSeoMetadata } from "@/lib/seo"
import { HOME_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { isPrefixedOrganicLocale } from "@/lib/international-seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: false } }
  const copy = HOME_ORGANIC_SEO[locale]
  return buildSeoMetadata({ ...copy, path: "/", locale, localizedAlternates: true, absoluteTitle: true })
}

export default async function LocalizedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <HomePage locale={locale} />
}
