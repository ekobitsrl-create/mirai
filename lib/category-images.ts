const CATEGORY_IMAGES: Record<string, string> = {
  abbigliamento: "/images/categories/abbigliamento.jpeg",
  apparel: "/images/categories/abbigliamento.jpeg",
  clothing: "/images/categories/abbigliamento.jpeg",
  profumi: "/images/categories/profumi.jpeg",
  profumo: "/images/categories/profumi.jpeg",
  fragrance: "/images/categories/profumi.jpeg",
  fragrances: "/images/categories/profumi.jpeg",
  "mirai-parfum-exlusive": "/images/categories/profumi.jpeg",
  "mirai-parfum-exclusive": "/images/categories/profumi.jpeg",
  jeans: "/images/categories/jeans.jpeg",
  pantaloni: "/images/categories/jeans.jpeg",
  pants: "/images/categories/jeans.jpeg",
  shorts: "/images/categories/shorts.jpeg",
  short: "/images/categories/shorts.jpeg",
  bermuda: "/images/categories/shorts.jpeg",
  sweatshirts: "/images/categories/sweatshirts.jpeg",
  sweatshirt: "/images/categories/sweatshirts.jpeg",
  felpe: "/images/categories/sweatshirts.jpeg",
  felpa: "/images/categories/sweatshirts.jpeg",
  hoodies: "/images/categories/sweatshirts.jpeg",
  hoodie: "/images/categories/sweatshirts.jpeg",
  "t-shirt": "/images/categories/t-shirt.jpeg",
  "t-shirts": "/images/categories/t-shirt.jpeg",
  tshirt: "/images/categories/t-shirt.jpeg",
  magliette: "/images/categories/t-shirt.jpeg",
  "tee-e-short": "/images/categories/tee-e-short.jpeg",
  "tee-e-shorts": "/images/categories/tee-e-short.jpeg",
  "tee-short": "/images/categories/tee-e-short.jpeg",
  "tee-shorts": "/images/categories/tee-e-short.jpeg",
  teeshorts: "/images/categories/tee-e-short.jpeg",
  tee: "/images/categories/tee-e-short.jpeg",
}

const DEFAULT_CATEGORY_IMAGE = "/images/collection-tshirt.jpg"

export function getCategoryImage(slug: string, databaseImage: string | null) {
  return CATEGORY_IMAGES[slug.toLowerCase()] || databaseImage || DEFAULT_CATEGORY_IMAGE
}
