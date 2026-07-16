import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { LanguageProvider } from '@/lib/language-context'
import { CookieBanner } from '@/components/cookie-banner'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { BackgroundMusic } from '@/components/background-music'
import { SiteIntro } from '@/components/site-intro'
import { MiraGuide } from '@/components/mira-guide'
import { MarketingPixels } from '@/components/marketing-pixels'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mirai-clothing.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: BASE_URL,
    siteName: "MIRAI",
    title: "MIRAI - Streetwear & Cappelli Custom | Moda Urbana",
    description: "Streetwear esclusivo e cappelli custom New Era con cristalli e borchie. Pezzi unici fatti a mano. Made in Italy.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MIRAI - Future of Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIRAI - Streetwear & Cappelli Custom",
    description: "Streetwear esclusivo e cappelli custom. Pezzi unici fatti a mano. Made in Italy.",
    images: ["/og-image.jpg"],
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
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a0f2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MIRAI",
              url: BASE_URL,
              logo: `${BASE_URL}/icon.svg`,
              description: "Streetwear esclusivo e cappelli custom New Era con cristalli e borchie. Pezzi unici fatti a mano. Made in Italy.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "Italian",
              },
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
