import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { LanguageProvider } from '@/lib/language-context'
import { CookieBanner } from '@/components/cookie-banner'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { BackgroundMusic } from '@/components/background-music'
import { SiteIntro } from '@/components/site-intro'
import { MiraGuide } from '@/components/mira-guide'
import { MarketingPixels } from '@/components/marketing-pixels'
import { getAbsoluteUrl, SITE_URL } from '@/lib/site-url'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

const GOOGLE_ANALYTICS_ID = "G-CY0KQKG7VG"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "MIRAI LAB STORE",
  title: {
    default: "MIRAI - Streetwear & Cappelli Custom | Moda Urbana Made in Italy",
    template: "%s | MIRAI",
  },
  description: "Scopri MIRAI: streetwear esclusivo e cappelli custom New Era con cristalli e borchie. Pezzi unici fatti a mano. Spedizione gratuita. Made in Italy.",
  keywords: [
    "streetwear", "cappelli custom", "New Era custom", "moda urbana",
    "abbigliamento streetwear", "cappelli personalizzati", "borchie",
    "cristalli", "made in italy", "fashion", "MIRAI", "techwear",
    "abbigliamento uomo", "cappelli fitted", "59FIFTY custom",
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
    siteName: "MIRAI",
    title: "MIRAI - Streetwear & Cappelli Custom | Moda Urbana",
    description: "Streetwear esclusivo e cappelli custom New Era con cristalli e borchie. Pezzi unici fatti a mano. Made in Italy.",
    images: [
      {
        url: getAbsoluteUrl("/images/hero-storefront.jpg"),
        width: 1200,
        height: 630,
        alt: "MIRAI LAB STORE - Streetwear Made in Italy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIRAI - Streetwear & Cappelli Custom",
    description: "Streetwear esclusivo e cappelli custom. Pezzi unici fatti a mano. Made in Italy.",
    images: [getAbsoluteUrl("/images/hero-storefront.jpg")],
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
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="mirai-google-analytics" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GOOGLE_ANALYTICS_ID}');`}
        </Script>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "MIRAI",
              url: SITE_URL,
              logo: getAbsoluteUrl("/icon.svg"),
              email: "mirailabstore@gmail.com",
              description: "Streetwear esclusivo e cappelli custom New Era con cristalli e borchie. Pezzi unici fatti a mano. Made in Italy.",
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
                email: "mirailabstore@gmail.com",
                availableLanguage: "Italian",
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
          <CartProvider>
            {children}
            <MiraGuide />
            <BackgroundMusic />
            <WhatsAppButton />
            <CookieBanner />
          </CartProvider>
        </LanguageProvider>
        <MarketingPixels />
        <Analytics />
      </body>
    </html>
  )
}
