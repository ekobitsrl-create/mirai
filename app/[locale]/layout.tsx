import { notFound } from "next/navigation"
import { LanguageProvider } from "@/lib/language-context"
import { isPrefixedOrganicLocale, PREFIXED_ORGANIC_LOCALES } from "@/lib/international-seo"

export function generateStaticParams() {
  return PREFIXED_ORGANIC_LOCALES.map((locale) => ({ locale }))
}

export default async function OrganicLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPrefixedOrganicLocale(locale)) notFound()

  return (
    <LanguageProvider initialLocale={locale} detectBrowserLanguage={false}>
      {children}
    </LanguageProvider>
  )
}
