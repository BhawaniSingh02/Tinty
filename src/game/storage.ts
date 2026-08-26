import { MAX_SCORE } from './scoring.ts'
import type { Difficulty } from './difficulty.ts'

/**
 * Solo stats in localStorage: personal best per difficulty, a consecutive-day
 * streak, games played, and a short history.
 *
 * Anti-cheat (CLAUDE.md): the key is a hash, not a readable name, and the value
 * is scrambled + base64'd under a `{ value, created }` envelope — so it isn't
 * one-click editable in devtools. This is a speed bump, not real security.
 *
 * Streak days are UTC calendar days, matching the daily-challenge reset.
 * Every read is guarded and falls back to sane defaults (private mode, quota,
 * corruption, schema drift).
 */

export interface SoloStats {
  best: Record<Difficulty, number>
  streak: { current: number; longest: number; lastPlayedYmd: string | null }
  gamesPlayed: number
  history: { score: number; difficulty: Difficulty; ymd: string }[]
}

export interface GameOutcome {
  stats: SoloStats
  score: number
  previousBest: number
  isNewBest: boolean
}

const SCHEMA = 'tinty/solo/v1'
const HISTORY_MAX = 10

const defaultStats = (): SoloStats => ({
  best: { easy: 0, hard: 0 },
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

const encode = (stats: SoloStats): string => btoa(scramble(JSON.stringify(stats)))
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

function write(stats: SoloStats): void {
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

function coerce(raw: unknown): SoloStats {
  const s = asObject(raw)
  const best = asObject(s.best)
  const streak = asObject(s.streak)
  const history = Array.isArray(s.history) ? s.history : []

  return {
    best: { easy: clampScore(best.easy), hard: clampScore(best.hard) },
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
      .map((h) => ({
        score: clampScore(h.score),
        difficulty: (h.difficulty === 'hard' ? 'hard' : 'easy') as Difficulty,
        ymd: h.ymd as string,
      })),
  }
}

// --- public API ---------------------------------------------------------

export function loadStats(): SoloStats {
  const env = readEnvelope()
  if (!env || env.value === undefined) return defaultStats()
  try {
    return coerce(decode(env.value as string))
  } catch {
    return defaultStats()
  }
}

export function personalBest(difficulty: Difficulty): number {
  return loadStats().best[difficulty]
}

/** The streak to show now — 0 if the last play was before yesterday. */
export function activeStreak(stats: SoloStats, now: Date = new Date()): number {
  const today = ymd(now)
  const { current, lastPlayedYmd } = stats.streak
  return lastPlayedYmd === today || lastPlayedYmd === dayBefore(today)
    ? current
    : 0
}

function advanceStreak(
  streak: SoloStats['streak'],
  today: string,
): SoloStats['streak'] {
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
export function recordGame(
  game: { seed: number; difficulty: Difficulty; score: number },
  now: Date = new Date(),
): GameOutcome {
  const stats = loadStats()
  const previousBest = stats.best[game.difficulty]
  const score = clampScore(game.score)
  const today = ymd(now)

  const next: SoloStats = {
    best: {
      ...stats.best,
      [game.difficulty]: Math.max(previousBest, score),
    },
    streak: advanceStreak(stats.streak, today),
    gamesPlayed: stats.gamesPlayed + 1,
    history: [
      { score, difficulty: game.difficulty, ymd: today },
      ...stats.history,
    ].slice(0, HISTORY_MAX),
  }

  write(next)
  return { stats: next, score, previousBest, isNewBest: score > previousBest }
}

/** Wipe all solo stats (for a future settings option / tests). */
export function clearStats(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
