/** One priceable item, as sourced into dataset/*.json. */
export interface PriceItem {
  category: string
  brand: string
  name: string
  image_url: string
  image_license: string
  price: number
  currency: string
  tier: 'low' | 'mid' | 'high'
  price_source: string
  /** Populated by scripts/download-price-images.mjs — a local /images/... path. */
  local_image?: string
}
