import type { Metadata } from "next"
import CollectionPage from "@/app/collezione/[slug]/page"
import { createClient } from "@/lib/supabase/server"
import { buildSeoMetadata, getCategorySeo } from "@/lib/seo"
import { localizeCategoryGuide, translateCategoryDescription } from "@/lib/catalog-localization"
import { translateCategory } from "@/lib/site-localization"
import { getAbsoluteUrl } from "@/lib/site-url"
import { isPrefixedOrganicLocale } from "@/lib/international-seo"

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params
  if (!isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: false } }
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase().replace(/\s+/g, "-")
  const supabase = await createClient()
  const { data: category } = await supabase
    .from("categories")
    .select("name, description, image_url")
    .ilike("slug", slug)
    .maybeSingle()
  const seo = getCategorySeo(slug)
  const name = translateCategory(slug, category?.name || slug.replace(/-/g, " "), locale)
  const guide = seo ? localizeCategoryGuide(seo.primaryKeyword, locale) : null
  const description = guide?.intro || translateCategoryDescription(slug, category?.description, locale)

  return buildSeoMetadata({
    title: guide?.heading || name,
    description,
    path: `/collezione/${encodeURIComponent(slug)}`,
    locale,
    localizedAlternates: true,
    keywords: [name, `${name} streetwear`, "MIRAI"],
    image: category?.image_url ? getAbsoluteUrl(category.image_url) : undefined,
  })
}

export default async function LocalizedCollectionPage({ params }: PageProps) {
  const { slug } = await params
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <CollectionPage params={Promise.resolve({ slug, locale })} />
}
