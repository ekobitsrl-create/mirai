type ProductIdentity = {
  name?: string | null
  image_url?: string | null
}

const BLACK_ISLAND_PATTERN = /black[\s_-]*island/i

export function isBlackIslandProduct(product: ProductIdentity) {
  return BLACK_ISLAND_PATTERN.test(product.name || "")
    || BLACK_ISLAND_PATTERN.test(product.image_url || "")
}

export function withoutBlackIslandProducts<T extends ProductIdentity>(products: T[]) {
  return products.filter((product) => !isBlackIslandProduct(product))
}
