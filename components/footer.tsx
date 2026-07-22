"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { PaymentBadges } from "@/components/payment-badges"
import { Building2, Mail, MapPin } from "lucide-react"

export function Footer() {
  const { t, locale } = useLanguage()
  const storeLabel = {
    it: "Negozio fisico",
    en: "Physical store",
    es: "Tienda física",
    de: "Ladengeschäft",
    fr: "Boutique physique",
  }[locale]
  const companyLabel = {
    it: "Dati aziendali",
    en: "Company details",
    es: "Datos de la empresa",
    de: "Unternehmensangaben",
    fr: "Informations légales",
  }[locale]

  const beatsLabel = {
    it: "I Nostri Beat",
    en: "Our Beats",
    es: "Nuestros Beats",
    de: "Unsere Beats",
    fr: "Nos Beats",
  }[locale]
  const storeAddressLabel = {
    it: "Indirizzo negozio",
    en: "Store address",
    es: "Direccion de la tienda",
    de: "Ladenadresse",
    fr: "Adresse de la boutique",
  }[locale]
  const supportEmailLabel = {
    it: "Email assistenza",
    en: "Support email",
    es: "Email de asistencia",
    de: "Support-E-Mail",
    fr: "E-mail assistance",
  }[locale]
  const communityLabel = {
    it: "Community",
    en: "Community",
    es: "Comunidad",
    de: "Community",
    fr: "Communaute",
  }[locale]

  const footerLinks = {
    shop: {
      title: t.footer.shop,
      links: [
        { label: t.footer.newArrivals, href: "/#nuovi-arrivi" },
        { label: t.footer.collections, href: "/collezioni" },
        { label: "T-shirt personalizzate", href: "/custom-lab" },
        { label: beatsLabel, href: "/i-nostri-beat" },
      ],
    },
    info: {
      title: t.footer.info,
      links: [
        { label: t.footer.aboutUs, href: "/chi-siamo" },
        { label: storeLabel, href: "/negozio" },
        { label: t.footer.contact, href: "/contatti" },
        { label: t.footer.shipping, href: "/spedizioni" },
        { label: t.footer.returnsRefunds, href: "/resi" },
        { label: t.footer.faq, href: "/faq" },
        { label: communityLabel, href: "/community" },
      ],
    },
    legal: {
      title: t.footer.legal,
      links: [
        { label: t.footer.privacyPolicy, href: "/privacy" },
        { label: t.footer.termsConditions, href: "/termini" },
        { label: t.footer.cookiePolicy, href: "/cookie-policy" },
      ],
    },
  }
  return (
    <footer className="mirai-neon-divider relative overflow-hidden bg-card/85">
      <div className="mirai-aurora-orb -left-40 top-8 h-80 w-80" />
      <div className="mirai-aurora-orb -right-40 bottom-0 h-96 w-96 [animation-delay:-5s]" />
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <span
              className="text-xl font-bold tracking-[0.25em] uppercase text-foreground mb-6 inline-block"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {"MIR\u039BI"}
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://www.instagram.com/mirai_labstore/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </Link>
              <Link href="#" aria-label="TikTok" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </Link>
              <Link href="#" aria-label="X/Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground mb-6">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="mirai-neon-card mt-14 overflow-hidden rounded-2xl px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_28px_rgba(159,134,255,0.24)]">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">{companyLabel}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">MIRAI LAB STORE DI SCRIVANO CHRISTIAN</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                  <span>P. IVA 06287920877</span>
                  <span>CF SCRCRS99C11C351W</span>
                  <span>REA CT - 486994</span>
                </div>
              </div>
            </div>
            <div className="grid divide-y divide-border text-xs text-muted-foreground sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:max-w-3xl">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Via+Umberto+95%2C+95129+Catania+CT"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 py-3 transition-colors hover:text-foreground sm:py-0 sm:pr-5"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{storeAddressLabel}</span>
                  Via Umberto 95, 95129 Catania (CT)
                </span>
              </a>
              <a href="mailto:info@mirailabstore.com" className="flex items-start gap-2.5 py-3 transition-colors hover:text-foreground sm:px-5 sm:py-0">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{supportEmailLabel}</span>
                  info@mirailabstore.com
                </span>
              </a>
              <a href="mailto:mirailabstore@pec.it" className="flex items-start gap-2.5 py-3 transition-colors hover:text-foreground sm:py-0 sm:pl-5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-primary">PEC</span>
                  mirailabstore@pec.it
                </span>
              </a>
            </div>
          </div>
        </section>

        <div className="mirai-neon-divider mt-12 flex flex-col items-center justify-between gap-6 pt-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 MIRAI. {t.footer.allRightsReserved}
            </p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("mirai:open-cookie-settings"))}
              className="text-[11px] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              {t.footer.manageCookies}
            </button>
          </div>
          <div className="flex w-full max-w-[344px] flex-col items-center gap-2 md:mr-24 md:items-end xl:mr-28">
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Pagamenti accettati
            </span>
            <PaymentBadges />
          </div>
        </div>
      </div>
    </footer>
  )
}
