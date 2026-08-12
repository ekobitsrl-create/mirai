import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GuideIndex } from "@/components/guide-index"
import { buildSeoMetadata, createBreadcrumbJsonLd, createWebPageJsonLd } from "@/lib/seo"

const GUIDE_DESCRIPTION =
  "Guide MIRAI su fit oversize, tessuti, outfit streetwear, cura dei capi, t-shirt personalizzate e cappelli custom."

export const metadata = buildSeoMetadata({
  title: "Guide streetwear: fit, outfit e custom",
  description: GUIDE_DESCRIPTION,
  path: "/guide",
  keywords: [
    "guide streetwear",
    "come veste una t-shirt oversize",
    "come creare un outfit streetwear uomo",
    "come personalizzare una t-shirt",
    "cappelli custom come vengono realizzati",
  ],
})

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#09070d] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createWebPageJsonLd({
            type: "CollectionPage",
            name: "Guide streetwear MIRAI",
            description: GUIDE_DESCRIPTION,
            path: "/guide",
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guide streetwear", path: "/guide" },
          ])),
        }}
      />
      <Navbar />
      <GuideIndex />

      <Footer />
    </main>
  )
}
