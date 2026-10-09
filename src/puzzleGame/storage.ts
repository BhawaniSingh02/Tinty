import { MAX_SCORE } from './scoring.ts'
import { PUZZLE_DIFFICULTIES, type PuzzleDifficulty } from './difficulty.ts'

/**
 * Picture Puzzle stats in localStorage: personal best per grid size, a
 * consecutive-day streak, games played, a short history, and the gallery
 * (which images have been completed). Same anti-cheat approach as the other
 * games' storage (obfuscated key, scrambled + base64'd value under a
 * `{ value, created }` envelope), in its own namespace.
 */

export interface PuzzleStats {
  best: Record<PuzzleDifficulty, number>
  streak: { current: number; longest: number; lastPlayedYmd: string | null }
  gamesPlayed: number
  history: { score: number; difficulty: PuzzleDifficulty; ymd: string }[]
  /** Image ids the player has completed at least once (any mode). */
  completed: string[]
}

export interface PuzzleGameOutcome {
  stats: PuzzleStats
  score: number
  previousBest: number
  isNewBest: boolean
  /** True when this game added the image to the gallery for the first time. */
  newInGallery: boolean
}

const SCHEMA = 'tinty/puzzle-solo/v1'
const HISTORY_MAX = 10

const zeroBests = (): Record<PuzzleDifficulty, number> => ({ easy: 0, medium: 0, hard: 0 })

export const defaultPuzzleStats = (): PuzzleStats => ({
  best: zeroBests(),
  streak: { current: 0, longest: 0, lastPlayedYmd: null },
  gamesPlayed: 0,
  history: [],
  completed: [],
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

const encode = (stats: PuzzleStats): string => btoa(scramble(JSON.stringify(stats)))
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

function write(stats: PuzzleStats): void {
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
  typeof n === 'number' && Number.isFinite(n) ? Math.min(MAX_SCORE, Math.max(0, n)) : 0

const count = (n: unknown): number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {}

const isDifficulty = (v: unknown): v is PuzzleDifficulty =>
  PUZZLE_DIFFICULTIES.includes(v as PuzzleDifficulty)

function coerce(raw: unknown): PuzzleStats {
  const s = asObject(raw)
  const best = asObject(s.best)
  const streak = asObject(s.streak)
  const history = Array.isArray(s.history) ? s.history : []
  const completed = Array.isArray(s.completed) ? s.completed : []

  return {
    best: {
      easy: clampScore(best.easy),
      medium: clampScore(best.medium),
      hard: clampScore(best.hard),
    },
    streak: {
      current: count(streak.current),
      longest: count(streak.longest),
      lastPlayedYmd: typeof streak.lastPlayedYmd === 'string' ? streak.lastPlayedYmd : null,
    },
    gamesPlayed: count(s.gamesPlayed),
    history: history
      .map(asObject)
      .filter((h) => typeof h.ymd === 'string' && isDifficulty(h.difficulty))
      .slice(0, HISTORY_MAX)
      .map((h) => ({
        score: clampScore(h.score),
        difficulty: h.difficulty as PuzzleDifficulty,
        ymd: h.ymd as string,
      })),
    completed: [...new Set(completed.filter((id): id is string => typeof id === 'string'))],
  }
}

// --- public API ---------------------------------------------------------

export function loadPuzzleStats(): PuzzleStats {
  const env = readEnvelope()
  if (!env || env.value === undefined) return defaultPuzzleStats()
  try {
    return coerce(decode(env.value as string))
  } catch {
    return defaultPuzzleStats()
  }
}

/** The 🔥 counter: consecutive UTC days with at least one finished puzzle. */
export function puzzleActiveStreak(stats: PuzzleStats, now: Date = new Date()): number {
  const today = ymd(now)
  const { current, lastPlayedYmd } = stats.streak
  return lastPlayedYmd === today || lastPlayedYmd === dayBefore(today) ? current : 0
}

function advanceStreak(streak: PuzzleStats['streak'], today: string): PuzzleStats['streak'] {
  if (streak.lastPlayedYmd === today) return streak
  const current = streak.lastPlayedYmd === dayBefore(today) ? streak.current + 1 : 1
  return { current, longest: Math.max(streak.longest, current), lastPlayedYmd: today }
}

/** Fold a finished puzzle into the stored stats + gallery and persist. */
export function recordPuzzleGame(
  game: { score: number; difficulty: PuzzleDifficulty; imageId: string },
  now: Date = new Date(),
): PuzzleGameOutcome {
  const stats = loadPuzzleStats()
  const previousBest = stats.best[game.difficulty]
  const score = clampScore(game.score)
  const today = ymd(now)
  const newInGallery = !stats.completed.includes(game.imageId)

  const next: PuzzleStats = {
    best: { ...stats.best, [game.difficulty]: Math.max(previousBest, score) },
    streak: advanceStreak(stats.streak, today),
    gamesPlayed: stats.gamesPlayed + 1,
    history: [{ score, difficulty: game.difficulty, ymd: today }, ...stats.history].slice(
      0,
      HISTORY_MAX,
    ),
    completed: newInGallery ? [...stats.completed, game.imageId] : stats.completed,
  }

  write(next)
  return { stats: next, score, previousBest, isNewBest: score > previousBest, newInGallery }
}
