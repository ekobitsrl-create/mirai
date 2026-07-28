export type GeneratedHeadwearImage = {
  src: string
  alt: string
  fit: "cover"
  position: string
}

function gallery(productId: string, productLabel: string): GeneratedHeadwearImage[] {
  const basePath = `/images/headwear-gallery/${productId}`

  return [
    {
      src: `${basePath}/side.webp`,
      alt: `${productLabel}, vista laterale`,
      fit: "cover",
      position: "center",
    },
    {
      src: `${basePath}/rear.webp`,
      alt: `${productLabel}, vista posteriore`,
      fit: "cover",
      position: "center",
    },
    {
      src: `${basePath}/worn.webp`,
      alt: `${productLabel} indossato`,
      fit: "cover",
      position: "center",
    },
  ]
}

export const HEADWEAR_GENERATED_GALLERIES: Record<string, GeneratedHeadwearImage[]> = {
  "b7629ec4-34d2-428b-b0d8-ccfd9317de99": gallery(
    "b7629ec4-34d2-428b-b0d8-ccfd9317de99",
    "Cappello LA azzurro e argento",
  ),
  "835cb227-c4f9-48db-88a2-d8a0ac021c66": gallery(
    "835cb227-c4f9-48db-88a2-d8a0ac021c66",
    "Cappello NY blu navy con cristalli rossi",
  ),
  "4c89683d-939d-427a-8a34-3e00f9509d1e": gallery(
    "4c89683d-939d-427a-8a34-3e00f9509d1e",
    "Cappello NY rosso e oro",
  ),
  "dc89f425-f02a-44e6-9694-b8131baed774": gallery(
    "dc89f425-f02a-44e6-9694-b8131baed774",
    "Cappello LA bianco e oro",
  ),
  "d7304772-f3df-4ad3-84b0-b2039f9812a1": gallery(
    "d7304772-f3df-4ad3-84b0-b2039f9812a1",
    "Cappello NY nero e oro",
  ),
}
