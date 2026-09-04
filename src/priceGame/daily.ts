import { dailySeed } from '../game/rng.ts'

export { formatDuration, msUntilReset } from '../game/daily.ts'

/**
 * The Price Check daily: one item set per UTC calendar day, deterministic
 * from the date, so everyone worldwide is guessing the same 5 items. One
 * attempt. Resets at 00:00 UTC — same reset clock as the Color Match daily,
 * but a different (salted) seed so the two dailies don't mirror each other.
 */

// Distinguishes this daily's seed from Color Match's `dailySeed(now)`.
const PRICE_DAILY_SALT = 0x50524943 // "PRIC"

export interface PriceDaily {
  ymd: string
  seed: number
}

export function todayPriceDaily(now: Date = new Date()): PriceDaily {
  return {
    ymd: now.toISOString().slice(0, 10),
    seed: (dailySeed(now) ^ PRICE_DAILY_SALT) >>> 0,
  }
}

// --- one-attempt-per-day guard (localStorage) ------------------------------

export interface PriceDailyOutcome {
  score: number
  breakdown: number[]
  /** True once this device has posted the score to the leaderboard. */
  posted?: boolean
}

const playedKey = (ymd: string) => `tinty.price.daily.${ymd}`

export function getPriceDailyResult(ymd: string): PriceDailyOutcome | null {
  try {
    const raw = localStorage.getItem(playedKey(ymd))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as PriceDailyOutcome).score === 'number' &&
      Array.isArray((parsed as PriceDailyOutcome).breakdown)
    ) {
      return parsed as PriceDailyOutcome
    }
    return null
  } catch {
    return null
  }
}

function writeDaily(ymd: string, outcome: PriceDailyOutcome): void {
  try {
    localStorage.setItem(playedKey(ymd), JSON.stringify(outcome))
  } catch {
    // private mode / quota — the daily just won't be remembered
  }
}

export function markPriceDailyPlayed(ymd: string, outcome: PriceDailyOutcome): void {
  writeDaily(ymd, outcome)
}

/** Record that the score has been posted, so we don't offer to post again. */
export function markPriceDailyPosted(ymd: string): void {
  const current = getPriceDailyResult(ymd)
  if (current) writeDaily(ymd, { ...current, posted: true })
}
