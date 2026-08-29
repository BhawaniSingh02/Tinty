import { MAX_SCORE } from './scoring.ts'

/**
 * Price Check solo stats in localStorage: personal best, a consecutive-day
 * streak, games played, and a short history — same shape and anti-cheat
 * approach as Color Match's game/storage.ts (obfuscated key, scrambled +
 * base64'd value under a `{ value, created }` envelope), kept in its own
 * namespace so the two games' bests don't collide.
 */

export interface PriceSoloStats {
  best: number
  streak: { current: number; longest: number; lastPlayedYmd: string | null }
  gamesPlayed: number
  history: { score: number; ymd: string }[]
}

export interface PriceGameOutcome {
  stats: PriceSoloStats
  score: number
  previousBest: number
  isNewBest: boolean
}

const SCHEMA = 'tinty/price-solo/v1'
const HISTORY_MAX = 10

const defaultStats = (): PriceSoloStats => ({
  best: 0,
  streak: { current: 0, longest: 0, lastPlayedYmd: null },
  gamesPlayed: 0,
  history: [],
})

// --- date helpers (UTC) -----------------------------------------------------

const ymd = (date: Date): string => date.toISOString().slice(0, 10)

function dayBefore(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return ymd(d)
}

// --- obfuscation ----------------------------------------------------------

function hashKey(seed: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `_${(h >>> 0).toString(36)}`
}

const KEY = hashKey(SCHEMA)

const scramble = (s: string): string => {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    out += String.fromCharCode(s.charCodeAt(i) ^ (0x2a + (i % 13)))
  }
  return out
}

const encode = (stats: PriceSoloStats): string =>
  btoa(scramble(JSON.stringify(stats)))
const decode = (raw: string): unknown => JSON.parse(scramble(atob(raw)))

// --- persistence ----------------------------------------------------------

function readEnvelope(): { value?: unknown; created?: number } | null {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function write(stats: PriceSoloStats): void {
  try {
    const created = readEnvelope()?.created ?? Date.now()
    localStorage.setItem(
      KEY,
      JSON.stringify({ value: encode(stats), created, updated: Date.now() }),
    )
  } catch {
    // private mode / quota exceeded — stats just won't persist
  }
}

// --- validation -----------------------------------------------------------

const clampScore = (n: unknown): number =>
  typeof n === 'number' && Number.isFinite(n)
    ? Math.min(MAX_SCORE, Math.max(0, n))
    : 0

const count = (n: unknown): number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {}

function coerce(raw: unknown): PriceSoloStats {
  const s = asObject(raw)
  const streak = asObject(s.streak)
  const history = Array.isArray(s.history) ? s.history : []

  return {
    best: clampScore(s.best),
    streak: {
      current: count(streak.current),
      longest: count(streak.longest),
      lastPlayedYmd:
        typeof streak.lastPlayedYmd === 'string' ? streak.lastPlayedYmd : null,
    },
    gamesPlayed: count(s.gamesPlayed),
    history: history
      .map(asObject)
      .filter((h) => typeof h.ymd === 'string')
      .slice(0, HISTORY_MAX)
      .map((h) => ({ score: clampScore(h.score), ymd: h.ymd as string })),
  }
}

// --- public API ---------------------------------------------------------

export function loadPriceStats(): PriceSoloStats {
  const env = readEnvelope()
  if (!env || env.value === undefined) return defaultStats()
  try {
    return coerce(decode(env.value as string))
  } catch {
    return defaultStats()
  }
}

export function priceActiveStreak(
  stats: PriceSoloStats,
  now: Date = new Date(),
): number {
  const today = ymd(now)
  const { current, lastPlayedYmd } = stats.streak
  return lastPlayedYmd === today || lastPlayedYmd === dayBefore(today)
    ? current
    : 0
}

function advanceStreak(
  streak: PriceSoloStats['streak'],
  today: string,
): PriceSoloStats['streak'] {
  if (streak.lastPlayedYmd === today) return streak
  const current =
    streak.lastPlayedYmd === dayBefore(today) ? streak.current + 1 : 1
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastPlayedYmd: today,
  }
}

/** Fold a finished game into the stored stats and persist. */
export function recordPriceGame(
  game: { score: number },
  now: Date = new Date(),
): PriceGameOutcome {
  const stats = loadPriceStats()
  const previousBest = stats.best
  const score = clampScore(game.score)
  const today = ymd(now)

  const next: PriceSoloStats = {
    best: Math.max(previousBest, score),
    streak: advanceStreak(stats.streak, today),
    gamesPlayed: stats.gamesPlayed + 1,
    history: [{ score, ymd: today }, ...stats.history].slice(0, HISTORY_MAX),
  }

  write(next)
  return { stats: next, score, previousBest, isNewBest: score > previousBest }
}
