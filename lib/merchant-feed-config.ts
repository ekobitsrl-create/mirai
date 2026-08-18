import type { EuCountryCode } from "@/lib/shipping"
import type { Locale } from "@/lib/translations"

export type MerchantFeedConfig = {
  locale: Locale
  contentLanguage: Locale
  dataSourceLabel: string
  endpoint: string
  targetCountries: readonly EuCountryCode[]
}

/**
 * Canonical configuration for every Merchant Center primary data source.
 *
 * The data source label is configured in Merchant Center, not inside the XML.
 * Keeping it here gives each endpoint an explicit contract and prevents an
 * international source from being accidentally recreated with the IT label.
 */
export const MERCHANT_FEED_CONFIG = {
  it: {
    locale: "it",
    contentLanguage: "it",
    dataSourceLabel: "IT",
    endpoint: "/google-merchant-feed.xml",
    targetCountries: ["IT"],
  },
  es: {
    locale: "es",
    contentLanguage: "es",
    dataSourceLabel: "EU_ES",
    endpoint: "/google-merchant-feed-es.xml",
    targetCountries: ["ES"],
  },
  de: {
    locale: "de",
    contentLanguage: "de",
    dataSourceLabel: "EU_DE",
    endpoint: "/google-merchant-feed-de.xml",
    targetCountries: ["DE", "AT"],
  },
  fr: {
    locale: "fr",
    contentLanguage: "fr",
    dataSourceLabel: "EU_FR",
    endpoint: "/google-merchant-feed-fr.xml",
    targetCountries: ["FR", "BE", "LU"],
  },
  en: {
    locale: "en",
    contentLanguage: "en",
    dataSourceLabel: "EU_EN",
    endpoint: "/google-merchant-feed-en.xml",
    targetCountries: [
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "GR",
      "HU",
      "IE",
      "LV",
      "LT",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "SE",
    ],
  },
} as const satisfies Record<Locale, MerchantFeedConfig>

const feedConfigs = Object.values(MERCHANT_FEED_CONFIG)

if (new Set(feedConfigs.map((config) => config.dataSourceLabel)).size !== feedConfigs.length) {
  throw new Error("Ogni feed Merchant deve avere un'etichetta origine dati univoca.")
}

if (MERCHANT_FEED_CONFIG.it.endpoint !== "/google-merchant-feed.xml"
  || MERCHANT_FEED_CONFIG.it.dataSourceLabel !== "IT"
  || MERCHANT_FEED_CONFIG.it.contentLanguage !== "it"
  || MERCHANT_FEED_CONFIG.it.targetCountries.join(",") !== "IT") {
  throw new Error("La configurazione del feed Merchant italiano non deve essere modificata.")
}
