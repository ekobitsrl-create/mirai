import type { Locale } from "@/lib/translations"

type SeoCopy = { title: string; description: string; keywords: string[] }

export const HOME_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Streetwear Catania | MIRAI LAB STORE", description: "MIRAI LAB STORE: streetwear a Catania e online. Scopri abbigliamento urban uomo, t-shirt oversize, cappelli custom e il Custom Lab.", keywords: ["streetwear Catania", "abbigliamento streetwear Catania", "MIRAI Lab Store", "abbigliamento urban uomo"] },
  en: { title: "Italian Streetwear Online | MIRAI LAB STORE", description: "Discover MIRAI LAB STORE: Italian streetwear, oversized T-shirts, urban clothing and custom caps, with EU-wide delivery.", keywords: ["Italian streetwear online", "European streetwear shop", "oversized T-shirts", "custom caps Europe"] },
  es: { title: "Streetwear italiano online | MIRAI LAB STORE", description: "Descubre MIRAI LAB STORE: streetwear italiano, camisetas oversize, ropa urbana y gorras custom con envío a la Unión Europea.", keywords: ["streetwear italiano online", "tienda streetwear Europa", "camisetas oversize", "gorras custom"] },
  de: { title: "Italienische Streetwear online | MIRAI LAB STORE", description: "Entdecke MIRAI LAB STORE: italienische Streetwear, Oversized-T-Shirts, Urban Clothing und Custom Caps mit EU-weitem Versand.", keywords: ["italienische Streetwear online", "Streetwear Shop Europa", "Oversized T-Shirts", "Custom Caps"] },
  fr: { title: "Streetwear italien en ligne | MIRAI LAB STORE", description: "Découvrez MIRAI LAB STORE : streetwear italien, T-shirts oversize, vêtements urbains et casquettes custom avec livraison dans l’UE.", keywords: ["streetwear italien en ligne", "boutique streetwear Europe", "T-shirts oversize", "casquettes custom"] },
}

export const COLLECTIONS_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Abbigliamento streetwear online", description: "Acquista abbigliamento streetwear online: t-shirt oversize, camicie, bermuda, cappelli custom e selezioni urban uomo MIRAI.", keywords: ["abbigliamento streetwear online", "shop streetwear italiano", "abbigliamento urban uomo"] },
  en: { title: "Italian streetwear clothing online", description: "Shop MIRAI Italian streetwear online: oversized T-shirts, shirts, denim shorts, custom caps and selected urban clothing with EU delivery.", keywords: ["Italian streetwear clothing", "streetwear online Europe", "urban clothing men"] },
  es: { title: "Ropa streetwear italiana online", description: "Compra streetwear MIRAI online: camisetas oversize, camisas, bermudas vaqueras, gorras custom y ropa urbana con envío en la UE.", keywords: ["ropa streetwear italiana", "streetwear online Europa", "ropa urbana hombre"] },
  de: { title: "Italienische Streetwear-Mode online", description: "MIRAI Streetwear online kaufen: Oversized-T-Shirts, Hemden, Jeansshorts, Custom Caps und Urban Clothing mit EU-weitem Versand.", keywords: ["italienische Streetwear Mode", "Streetwear online Europa", "Urban Clothing Herren"] },
  fr: { title: "Vêtements streetwear italiens en ligne", description: "Achetez le streetwear MIRAI en ligne : T-shirts oversize, chemises, bermudas en denim, casquettes custom et vêtements urbains livrés dans l’UE.", keywords: ["vêtements streetwear italiens", "streetwear en ligne Europe", "vêtements urbains homme"] },
}

export const GUIDES_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Guide streetwear: fit, outfit e custom", description: "Guide MIRAI su fit oversize, tessuti, outfit streetwear, cura dei capi, t-shirt personalizzate e cappelli custom.", keywords: ["guide streetwear", "fit oversize", "outfit streetwear uomo"] },
  en: { title: "Streetwear guides: fits, outfits and custom pieces", description: "MIRAI guides to oversized fits, fabrics, streetwear outfits, garment care, custom T-shirts and custom caps.", keywords: ["streetwear guides", "oversized fit guide", "men's streetwear outfits"] },
  es: { title: "Guías streetwear: cortes, looks y custom", description: "Guías MIRAI sobre cortes oversize, tejidos, looks streetwear, cuidado de prendas, camisetas y gorras custom.", keywords: ["guías streetwear", "corte oversize", "looks streetwear hombre"] },
  de: { title: "Streetwear-Guides: Fits, Outfits und Custom Pieces", description: "MIRAI Guides zu Oversized-Fits, Materialien, Streetwear-Outfits, Pflege, Custom T-Shirts und Custom Caps.", keywords: ["Streetwear Guides", "Oversized Fit Guide", "Streetwear Outfits Herren"] },
  fr: { title: "Guides streetwear : coupes, looks et pièces custom", description: "Guides MIRAI sur les coupes oversize, les matières, les looks streetwear, l’entretien, les T-shirts et casquettes custom.", keywords: ["guides streetwear", "coupe oversize", "looks streetwear homme"] },
}
