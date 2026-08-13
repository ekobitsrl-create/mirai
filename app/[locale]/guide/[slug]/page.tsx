import type { Metadata } from "next"
import GuideArticlePage from "@/app/guide/[slug]/page"
import { buildSeoMetadata } from "@/lib/seo"
import { getSeoGuide, localizeSeoGuide, SEO_GUIDES } from "@/lib/seo-guides"
import { isPrefixedOrganicLocale, PREFIXED_ORGANIC_LOCALES } from "@/lib/international-seo"

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return PREFIXED_ORGANIC_LOCALES.flatMap((locale) => SEO_GUIDES.map((guide) => ({ locale, slug: guide.slug })))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const guide = getSeoGuide(slug)
  if (!guide || !isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: true } }
  const localized = localizeSeoGuide(guide, locale)
  return buildSeoMetadata({
    title: localized.title,
    description: localized.description,
    path: `/guide/${guide.slug}`,
    locale,
    localizedAlternates: true,
    keywords: [localized.primaryKeyword, ...localized.relatedKeywords],
  })
}

export default async function LocalizedGuideArticlePage({ params }: PageProps) {
  const { slug } = await params
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <GuideArticlePage params={Promise.resolve({ slug, locale })} />
}
