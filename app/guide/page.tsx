import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GuideIndex } from "@/components/guide-index"
import { buildSeoMetadata, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo"
import type { Locale } from "@/lib/translations"
import { GUIDES_ORGANIC_SEO } from "@/lib/organic-seo-copy"
import { localizedOrganicPath } from "@/lib/international-seo"

const GUIDE_DESCRIPTION =
  "Guide MIRΛI su fit oversize, tessuti, outfit streetwear, cura dei capi, t-shirt personalizzate e cappelli custom."

export const metadata = buildSeoMetadata({
  title: "Guide streetwear: fit, outfit e custom",
  description: GUIDE_DESCRIPTION,
  path: "/guide",
  localizedAlternates: true,
  keywords: [
    "guide streetwear",
    "come veste una t-shirt oversize",
    "come creare un outfit streetwear uomo",
    "come personalizzare una t-shirt",
    "cappelli custom come vengono realizzati",
  ],
})

export default function GuidePage({ locale = "it" }: { locale?: Locale } = {}) {
  const seoCopy = GUIDES_ORGANIC_SEO[locale]
  return (
    <main className="min-h-screen bg-[#09070d] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({
            type: "CollectionPage",
            name: seoCopy.title,
            description: seoCopy.description,
            path: localizedOrganicPath("/guide", locale),
            locale,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "MIRΛI", path: localizedOrganicPath("/", locale) },
            { name: seoCopy.title, path: localizedOrganicPath("/guide", locale) },
          ])),
        }}
      />
      <Navbar />
      <GuideIndex />

      <Footer />
    </main>
  )
}
