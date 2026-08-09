const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.gstatic.com https://apis.google.com https://connect.facebook.net https://analytics.tiktok.com https://*.posthog.com https://js.stripe.com https://checkout.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://graph.facebook.com https://analytics.tiktok.com https://api.stripe.com https://checkout.stripe.com",
  "frame-src 'self' https://*.stripe.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }]
  },
  images: {
    formats: ['image/webp'],
    qualities: [90],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'xbendkxwuaqrxsyrmgye.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
