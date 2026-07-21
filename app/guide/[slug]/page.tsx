import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getSeoGuide, SEO_GUIDES } from "@/lib/seo-guides"
import { buildSeoMetadata, createBreadcrumbJsonLd } from "@/lib/seo"
import { getAbsoluteUrl, SITE_URL } from "@/lib/site-url"

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
    keywords: [guide.primaryKeyword, ...guide.relatedKeywords],
  })
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getSeoGuide(slug)
  if (!guide) notFound()

  const articleUrl = getAbsoluteUrl(`/guide/${guide.slug}`)
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
    inLanguage: "it-IT",
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
            { name: "Home", path: "/" },
            { name: "Guide", path: "/guide" },
            { name: guide.title, path: `/guide/${guide.slug}` },
          ])),
        }}
      />
      <Navbar />

      <article>
        <header className="relative overflow-hidden border-b border-white/10 px-6 pb-16 pt-40 sm:pb-20">
          <div className="pointer-events-none absolute left-1/2 top-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/14 blur-[140px]" />
          <div className="relative mx-auto max-w-4xl">
            <Link href="/guide" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" /> Tutte le guide
            </Link>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">{guide.primaryKeyword}</p>
            <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-[clamp(2.35rem,6vw,5rem)] font-bold leading-[0.96] tracking-[-0.05em]">
              {guide.title}
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.17em] text-white/35">
              <span>MIRAI LAB STORE</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> {readingMinutes} min</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <time dateTime={guide.updatedAt}>Aggiornata il 21 luglio 2026</time>
            </div>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">{guide.intro}</p>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-24">
          <div className="max-w-3xl">
            {guide.sections.map((section, index) => (
              <section key={section.heading} className={index > 0 ? "mt-14 border-t border-white/10 pt-14" : ""}>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{section.heading}</h2>
                <div className="mt-5 space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-white/55 sm:text-base sm:leading-8">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white">In breve</h2>
              <ul className="mt-5 space-y-4">
                {guide.takeaways.map((takeaway) => (
                  <li key={takeaway} className="flex items-start gap-3 text-xs leading-5 text-white/50">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {takeaway}
                  </li>
                ))}
              </ul>
              <Link href={guide.cta.href} className="mt-7 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-white">
                {guide.cta.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  )
}
