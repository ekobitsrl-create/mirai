import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GuideArticle } from "@/components/guide-article"
import { getSeoGuide, SEO_GUIDES } from "@/lib/seo-guides"
import { buildSeoMetadata, createBreadcrumbJsonLd } from "@/lib/seo"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"
import type { Locale } from "@/lib/translations"
import { localizeSeoGuide } from "@/lib/seo-guides"
import { HTML_LOCALES, localizedOrganicPath } from "@/lib/international-seo"

type GuidePageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return SEO_GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getSeoGuide(slug)

  if (!guide) return { title: "Guida non trovata", robots: { index: false, follow: true } }

  return buildSeoMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guide/${guide.slug}`,
    localizedAlternates: true,
    keywords: [guide.primaryKeyword, ...guide.relatedKeywords],
  })
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string; locale?: Locale }> }) {
  const { slug, locale = "it" } = await params
  const baseGuide = getSeoGuide(slug)
  if (!baseGuide) notFound()
  const guide = localizeSeoGuide(baseGuide, locale)

  const articleUrl = getAbsoluteUrl(localizedOrganicPath(`/guide/${guide.slug}`, locale))
  const readingMinutes = Math.max(
    3,
    Math.ceil(
      [guide.intro, ...guide.sections.flatMap((section) => section.paragraphs)].join(" ").split(/\s+/).length / 200,
    ),
  )
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: guide.title,
    description: guide.description,
    image: getAbsoluteUrl("/images/hero-storefront.jpg"),
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: HTML_LOCALES[locale],
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    keywords: [guide.primaryKeyword, ...guide.relatedKeywords].join(", "),
  }

  return (
    <main className="min-h-screen bg-[#09070d] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "MIRΛI", path: localizedOrganicPath("/", locale) },
            { name: locale === "it" ? "Guide" : guide.primaryKeyword, path: localizedOrganicPath("/guide", locale) },
            { name: guide.title, path: localizedOrganicPath(`/guide/${guide.slug}`, locale) },
          ])),
        }}
      />
      <Navbar />

      <GuideArticle guide={guide} readingMinutes={readingMinutes} />

      <Footer />
    </main>
  )
}
