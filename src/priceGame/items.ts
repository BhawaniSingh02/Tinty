import type { PriceItem } from './types.ts'

/**
 * Every JSON file dropped into dataset/ (one array of PriceItem per category)
 * is picked up automatically — no per-category wiring needed as more
 * categories are added later.
 */
const modules = import.meta.glob<{ default: PriceItem[] }>(
  '../../dataset/*.json',
  { eager: true },
)

const ALL_ITEMS: PriceItem[] = Object.values(modules).flatMap(
  (mod) => mod.default,
)

/** Only items with a locally-hosted image (never hotlink the source URL). */
export const PRICE_ITEMS: PriceItem[] = ALL_ITEMS.filter(
  (item) => !!item.local_image,
)

export const CATEGORIES: string[] = Array.from(
  new Set(PRICE_ITEMS.map((item) => item.category)),
).sort()
