type CatalogProductIdentity = {
  id: string
  supplier_sku?: string | null
  color_name?: string | null
}

export function normalizeCatalogIdentifier(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function stableCatalogHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

export function getCatalogItemId(product: CatalogProductIdentity, size: string) {
  const source = product.supplier_sku
    ? `${product.supplier_sku}-${product.color_name || product.id}-${size}`
    : `${product.id}-${size}`
  const candidate = normalizeCatalogIdentifier(source)

  if (candidate.length <= 50) return candidate

  const suffix = stableCatalogHash(`${product.id}-${size}`)
  return `${candidate.slice(0, 49 - suffix.length)}-${suffix}`
}
