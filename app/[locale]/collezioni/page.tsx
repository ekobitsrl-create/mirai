import type { Metadata } from "next"
import CollectionsPage from "@/app/collezioni/page"
import { buildSeoMetadata } from "@/lib/seo"
import { COLLECTIONS_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { isPrefixedOrganicLocale } from "@/lib/international-seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: false } }
  const copy = COLLECTIONS_ORGANIC_SEO[locale]
  return buildSeoMetadata({ ...copy, path: "/collezioni", locale, localizedAlternates: true })
}

export default async function LocalizedCollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <CollectionsPage locale={locale} />
}
