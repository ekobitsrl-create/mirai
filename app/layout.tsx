import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { CartAddedBanner } from '@/components/cart-added-banner'
import { LanguageProvider } from '@/lib/language-context'
import { CookieBanner } from '@/components/cookie-banner'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { BackgroundMusic } from '@/components/background-music'
import { SiteIntro } from '@/components/site-intro'
import { LazySiteLocalizer } from '@/components/lazy-site-localizer'
import { LazyMiraGuide } from '@/components/lazy-mira-guide'
import { MarketingPixels } from '@/components/marketing-pixels'
import { GoogleIntegrations } from '@/components/google-integrations'
import { PostHogProvider } from '@/components/posthog-provider'
import { COMPANY_INFO } from '@/lib/company-info'
import { getAbsoluteUrl, SITE_URL } from '@/lib/site-url'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "MIRAI LAB STORE",
  title: {
    default: "MIRAI LAB STORE | Streetwear e cappelli custom",
    template: "%s | MIRAI",
  },
  description: "MIRAI LAB STORE: abbigliamento streetwear online, capi oversize, cappelli custom e t-shirt personalizzate. Nato a Catania.",
  keywords: [
    "MIRAI Lab Store", "MIRAI Concept Store", "MIRAI Store Catania",
    "MIRAI streetwear", "MIRAI Custom Lab", "MIRAI cappelli custom",
    "abbigliamento streetwear online", "streetwear Catania",
  ],
  authors: [{ name: "MIRAI" }],
  creator: "MIRAI",
  publisher: "MIRAI",
  category: "fashion",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "MIRAI LAB STORE",
    title: "MIRAI LAB STORE | Streetwear e cappelli custom",
    description: "Abbigliamento streetwear online, capi oversize, cappelli custom e t-shirt personalizzate. Nato a Catania.",
    images: [
      {
        url: getAbsoluteUrl("/images/categories/shorts.jpeg"),
        width: 1536,
        height: 1024,
        alt: "MIRAI LAB STORE - Streetwear e abbigliamento urban",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIRAI LAB STORE | Streetwear e cappelli custom",
    description: "Abbigliamento streetwear online, capi oversize, cappelli custom e t-shirt personalizzate. Nato a Catania.",
    images: [getAbsoluteUrl("/images/categories/shorts.jpeg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    types: {
      "application/xml": getAbsoluteUrl("/google-merchant-feed.xml"),
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#070708',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <head>
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});`}
        </Script>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <PostHogProvider>
          <GoogleIntegrations />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "MIRAI LAB STORE",
              legalName: COMPANY_INFO.legalName,
              alternateName: ["MIRAI", "MIRAI Concept Store", "MIRAI Store Catania"],
              url: SITE_URL,
              logo: getAbsoluteUrl("/icon.svg"),
              email: COMPANY_INFO.email,
              telephone: "+39 349 866 3584",
              description: "Concept store streetwear nato a Catania: abbigliamento urban, cappelli custom e t-shirt personalizzate online.",
              sameAs: ["https://www.instagram.com/mirai_labstore/"],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Via Umberto 95",
                postalCode: "95129",
                addressLocality: "Catania",
                addressRegion: "CT",
                addressCountry: "IT",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: COMPANY_INFO.email,
                telephone: "+39 349 866 3584",
                availableLanguage: "Italian",
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                "@id": `${SITE_URL}/resi#return-policy`,
                applicableCountry: "IT",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 30,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
                refundType: "https://schema.org/FullRefund",
                restockingFee: {
                  "@type": "MonetaryAmount",
                  value: "0.00",
                  currency: "EUR",
                },
                url: getAbsoluteUrl("/resi"),
              },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: "MIRAI LAB STORE",
              url: SITE_URL,
              inLanguage: "it-IT",
              publisher: { "@id": `${SITE_URL}/#organization` },
              }),
            }}
          />
          <SiteIntro />
          <LanguageProvider>
            <LazySiteLocalizer />
            <CartProvider>
              {children}
              <CartAddedBanner />
              <LazyMiraGuide />
              <BackgroundMusic />
              <WhatsAppButton />
              <CookieBanner />
            </CartProvider>
          </LanguageProvider>
          <MarketingPixels />
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  )
}
