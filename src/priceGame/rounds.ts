import { mulberry32, type Rng } from '../game/rng.ts'
import { PRICE_ITEMS } from './items.ts'
import type { PriceItem } from './types.ts'
import { ROUNDS } from './scoring.ts'

function shuffled<T>(arr: readonly T[], rng: Rng): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Picks `ROUNDS` items for a seeded game. Best-effort variety: shuffles
 * deterministically from the seed, then greedily prefers items that add a new
 * category or tier not yet in the round so a 5-round set doesn't repeat
 * itself — falls back to whatever's left once the pool is small.
 */
export function generateRounds(seed: number, pool: PriceItem[] = PRICE_ITEMS): PriceItem[] {
  const rng = mulberry32(seed)
  const candidates = shuffled(pool, rng)

  const picked: PriceItem[] = []
  const seenCategories = new Set<string>()
  const seenTiers = new Set<string>()

  for (const item of candidates) {
    if (picked.length >= ROUNDS) break
    const isNew = !seenCategories.has(item.category) || !seenTiers.has(item.tier)
    if (isNew) {
      picked.push(item)
      seenCategories.add(item.category)
      seenTiers.add(item.tier)
    }
  }

  if (picked.length < ROUNDS) {
    for (const item of candidates) {
      if (picked.length >= ROUNDS) break
      if (!picked.includes(item)) picked.push(item)
    }
  }

  return picked
}
