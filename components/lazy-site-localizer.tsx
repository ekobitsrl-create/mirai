"use client"

import dynamic from "next/dynamic"

const SiteLocalizer = dynamic(
  () => import("@/components/site-localizer").then((module) => module.SiteLocalizer),
  { ssr: false },
)

export function LazySiteLocalizer() {
  // The same pass also applies the MIRΛI/MIRΛ wordmarks in the source
  // language, while preserving coupon codes and technical identifiers.
  return <SiteLocalizer />
}
