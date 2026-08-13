"use client"

import dynamic from "next/dynamic"
import { useLanguage } from "@/lib/language-context"

const SiteLocalizer = dynamic(
  () => import("@/components/site-localizer").then((module) => module.SiteLocalizer),
  { ssr: false },
)

export function LazySiteLocalizer() {
  const { locale } = useLanguage()

  // Italian is the source language. The large fallback dictionary is only
  // needed after a visitor selects another language.
  return locale === "it" ? null : <SiteLocalizer />
}
