import type { Locale } from "@/lib/translations"

type SeoCopy = { title: string; description: string; keywords: string[] }

export const HOME_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Streetwear Catania | MIRAI LAB STORE", description: "MIRAI LAB STORE: streetwear a Catania e online. Scopri abbigliamento urban uomo, t-shirt oversize, cappelli custom e il Custom Lab.", keywords: ["streetwear Catania", "abbigliamento streetwear Catania", "MIRAI Lab Store", "abbigliamento urban uomo"] },
  en: { title: "Italian Urban Streetwear Online | MIRAI LAB STORE", description: "Shop MIRAI's Italian urban streetwear across Europe: oversized T-shirts, statement denim, custom caps and curated drops with EU delivery.", keywords: ["Italian urban streetwear", "European streetwear shop", "oversized T-shirts Europe", "custom caps Europe"] },
  es: { title: "Streetwear urbano italiano online | MIRAI LAB STORE", description: "Compra streetwear urbano italiano MIRAI en España y Europa: camisetas oversize, denim, gorras custom y drops seleccionados con envío en la UE.", keywords: ["streetwear urbano italiano", "tienda streetwear España", "camisetas oversize España", "gorras custom Europa"] },
  de: { title: "Italienische Urban Streetwear online | MIRAI LAB STORE", description: "Entdecke italienische Urban Streetwear von MIRAI für Deutschland und Europa: Oversized-T-Shirts, Statement-Denim, Custom Caps und kuratierte Drops mit EU-Versand.", keywords: ["italienische Urban Streetwear", "Streetwear Shop Deutschland", "Oversized T-Shirts Deutschland", "Custom Caps Europa"] },
  fr: { title: "Streetwear urbain italien en ligne | MIRAI LAB STORE", description: "Découvrez le streetwear urbain italien MIRAI en France et en Europe : T-shirts oversize, denim, casquettes custom et sélections exclusives livrées dans l’UE.", keywords: ["streetwear urbain italien", "boutique streetwear France", "T-shirts oversize France", "casquettes custom Europe"] },
}

export const COLLECTIONS_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Abbigliamento streetwear online", description: "Acquista abbigliamento streetwear online: t-shirt oversize, camicie, bermuda, cappelli custom e selezioni urban uomo MIRAI.", keywords: ["abbigliamento streetwear online", "shop streetwear italiano", "abbigliamento urban uomo"] },
  en: { title: "Italian streetwear clothing online", description: "Shop MIRAI Italian streetwear online: oversized T-shirts, shirts, denim shorts, custom caps and selected urban clothing with EU delivery.", keywords: ["Italian streetwear clothing", "streetwear online Europe", "urban clothing men"] },
  es: { title: "Ropa streetwear italiana en España", description: "Compra streetwear urbano italiano MIRAI en España: camisetas oversize, camisas, bermudas vaqueras y gorras custom con envío en España y la UE.", keywords: ["ropa streetwear italiana España", "tienda streetwear España", "ropa urbana hombre España"] },
  de: { title: "Italienische Streetwear für Deutschland", description: "MIRAI Streetwear für Deutschland online kaufen: Oversized-T-Shirts, Hemden, Jeansshorts und Custom Caps mit Versand in Deutschland und der EU.", keywords: ["italienische Streetwear Deutschland", "Streetwear Shop Deutschland", "Urban Clothing Herren Deutschland"] },
  fr: { title: "Streetwear italien en France", description: "Achetez le streetwear urbain italien MIRAI en France : T-shirts oversize, chemises, bermudas en denim et casquettes custom livrés en France et dans l’UE.", keywords: ["streetwear italien France", "boutique streetwear France", "vêtements urbains homme France"] },
}

export const GUIDES_ORGANIC_SEO: Record<Locale, SeoCopy> = {
  it: { title: "Guide streetwear: fit, outfit e custom", description: "Guide MIRAI su fit oversize, tessuti, outfit streetwear, cura dei capi, t-shirt personalizzate e cappelli custom.", keywords: ["guide streetwear", "fit oversize", "outfit streetwear uomo"] },
  en: { title: "Streetwear guides: fits, outfits and custom pieces", description: "MIRAI guides to oversized fits, fabrics, streetwear outfits, garment care, custom T-shirts and custom caps.", keywords: ["streetwear guides", "oversized fit guide", "men's streetwear outfits"] },
  es: { title: "Guías streetwear: cortes, looks y custom", description: "Guías MIRAI sobre cortes oversize, tejidos, looks streetwear, cuidado de prendas, camisetas y gorras custom.", keywords: ["guías streetwear", "corte oversize", "looks streetwear hombre"] },
  de: { title: "Streetwear-Guides: Fits, Outfits und Custom Pieces", description: "MIRAI Guides zu Oversized-Fits, Materialien, Streetwear-Outfits, Pflege, Custom T-Shirts und Custom Caps.", keywords: ["Streetwear Guides", "Oversized Fit Guide", "Streetwear Outfits Herren"] },
  fr: { title: "Guides streetwear : coupes, looks et pièces custom", description: "Guides MIRAI sur les coupes oversize, les matières, les looks streetwear, l’entretien, les T-shirts et casquettes custom.", keywords: ["guides streetwear", "coupe oversize", "looks streetwear homme"] },
}
