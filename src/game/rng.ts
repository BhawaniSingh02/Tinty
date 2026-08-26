/**
 * Deterministic randomness for Color Match.
 *
 * A game's 5 colors come entirely from a numeric seed, so:
 *  - a challenge link (`/c/:code`) carries the seed in the URL — no backend
 *  - the daily is `dailySeed(today)`, identical for everyone worldwide
 *  - replays are reproducible
 *
 * Seeds live in [0, SEED_SPACE) so every code is exactly 6 base-36 chars.
 */

export type Rng = () => number

export const SEED_SPACE = 36 ** 6 // 2,176,782,336

/** mulberry32 — small, fast, deterministic. Same seed → same sequence. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** Float in [min, max). */
export function randRange(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min
}

/** A fresh random seed for a new solo game. */
export function randomSeed(): number {
  return Math.floor(Math.random() * SEED_SPACE)
}

/** Seed → 6-char lowercase base-36 code (e.g. "0x1a2b"). */
export function seedToCode(seed: number): string {
  const n = ((Math.trunc(seed) % SEED_SPACE) + SEED_SPACE) % SEED_SPACE
  return n.toString(36).padStart(6, '0')
}

/** Code → seed, or null if the code is malformed / out of range. */
export function codeToSeed(code: string): number | null {
  const c = code.trim().toLowerCase()
  if (!/^[0-9a-z]{6}$/.test(c)) return null
  const n = parseInt(c, 36)
  return Number.isFinite(n) && n >= 0 && n < SEED_SPACE ? n : null
}

/**
 * Seed for a date's daily challenge. Uses the UTC calendar date, so the daily
 * rolls over at 00:00 UTC — the documented reset standard.
 */
export function dailySeed(date: Date = new Date()): number {
  const key =
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  return hash32(key) % SEED_SPACE
}

export function dailyCode(date?: Date): string {
  return seedToCode(dailySeed(date))
}

/** Spread consecutive integers across the 32-bit range (avalanche). */
function hash32(n: number): number {
  let h = n >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  return (h ^ (h >>> 16)) >>> 0
}
