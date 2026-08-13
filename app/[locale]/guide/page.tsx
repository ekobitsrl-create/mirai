import type { Metadata } from "next"
import GuidePage from "@/app/guide/page"
import { buildSeoMetadata } from "@/lib/seo"
import { GUIDES_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { isPrefixedOrganicLocale } from "@/lib/international-seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: false } }
  const copy = GUIDES_ORGANIC_SEO[locale]
  return buildSeoMetadata({ ...copy, path: "/guide", locale, localizedAlternates: true })
}

export default async function LocalizedGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <GuidePage locale={locale} />
}
