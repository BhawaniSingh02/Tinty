import { dailySeed } from './rng.ts'
import type { Difficulty } from './difficulty.ts'

/**
 * The daily challenge: one color set per UTC calendar day, deterministic from
 * the date, so everyone worldwide plays the same five colors. One attempt.
 * Resets at 00:00 UTC.
 */

export const DAILY_DIFFICULTY: Difficulty = 'easy'

export interface Daily {
  ymd: string
  seed: number
  difficulty: Difficulty
}

export function todayDaily(now: Date = new Date()): Daily {
  return {
    ymd: now.toISOString().slice(0, 10),
    seed: dailySeed(now),
    difficulty: DAILY_DIFFICULTY,
  }
}

/** Milliseconds until the next 00:00 UTC. */
export function msUntilReset(now: Date = new Date()): number {
  const next = new Date(now)
  next.setUTCHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}h ${pad(m)}m ${pad(s)}s` : `${m}m ${pad(s)}s`
}

// --- one-attempt-per-day guard (localStorage) ------------------------------

export interface DailyOutcome {
  score: number
  breakdown: number[]
  /** True once this device has posted the score to the leaderboard. */
  posted?: boolean
}

const playedKey = (ymd: string) => `tinty.daily.${ymd}`

export function getDailyResult(ymd: string): DailyOutcome | null {
  try {
    const raw = localStorage.getItem(playedKey(ymd))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as DailyOutcome).score === 'number' &&
      Array.isArray((parsed as DailyOutcome).breakdown)
    ) {
      return parsed as DailyOutcome
    }
    return null
  } catch {
    return null
  }
}

function writeDaily(ymd: string, outcome: DailyOutcome): void {
  try {
    localStorage.setItem(playedKey(ymd), JSON.stringify(outcome))
  } catch {
    // private mode / quota — the daily just won't be remembered
  }
}

export function markDailyPlayed(ymd: string, outcome: DailyOutcome): void {
  writeDaily(ymd, outcome)
}

/** Record that the score has been posted, so we don't offer to post again. */
export function markDailyPosted(ymd: string): void {
  const current = getDailyResult(ymd)
  if (current) writeDaily(ymd, { ...current, posted: true })
}
