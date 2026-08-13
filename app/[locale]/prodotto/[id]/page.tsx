import type { Metadata } from "next"
import ProductPage from "@/app/prodotto/[id]/page"
import { createClient } from "@/lib/supabase/server"
import { getDemoProduct, isBlackIslandProduct, isPrivateCheckoutProduct, mapProductRow } from "@/lib/products"
import { localizeProduct } from "@/lib/catalog-localization"
import { buildSeoMetadata } from "@/lib/seo"
import { getAbsoluteUrl } from "@/lib/site-url"
import { isPrefixedOrganicLocale } from "@/lib/international-seo"

type PageProps = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params
  if (!isPrefixedOrganicLocale(locale)) return { robots: { index: false, follow: false } }
  let product: any = getDemoProduct(id)
  if (!product) {
    const supabase = await createClient()
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
    product = data ? mapProductRow(data) : null
  }
  if (!product || isBlackIslandProduct(product)) return { title: "Product not found", robots: { index: false, follow: true } }

  const localized = localizeProduct(product, locale)
  return buildSeoMetadata({
    title: localized.name,
    description: localized.description,
    path: `/prodotto/${encodeURIComponent(id)}`,
    locale,
    localizedAlternates: !isPrivateCheckoutProduct(product),
    image: product.image_url ? getAbsoluteUrl(product.image_url) : undefined,
    absoluteTitle: true,
    keywords: [localized.name, "MIRAI streetwear"],
  })
}

export default async function LocalizedProductPage({ params }: PageProps) {
  const { id } = await params
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) return null
  return <ProductPage params={Promise.resolve({ id, locale })} />
}
