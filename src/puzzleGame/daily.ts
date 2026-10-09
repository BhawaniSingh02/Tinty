import { dailySeed } from '../game/rng.ts'
import { DAILY_PUZZLE_DIFFICULTY, type PuzzleDifficulty } from './difficulty.ts'

export { formatDuration, msUntilReset } from '../game/daily.ts'

/**
 * The Picture Puzzle daily: one image + shuffle per UTC calendar day,
 * deterministic from the date, so everyone worldwide solves the same board.
 * One attempt. Resets at 00:00 UTC — the same clock as the other dailies, with
 * a salted seed so it doesn't mirror them.
 */

const PUZZLE_DAILY_SALT = 0x50555a5a // "PUZZ"

export interface PuzzleDaily {
  ymd: string
  seed: number
  difficulty: PuzzleDifficulty
}

export function todayPuzzleDaily(now: Date = new Date()): PuzzleDaily {
  return {
    ymd: now.toISOString().slice(0, 10),
    seed: (dailySeed(now) ^ PUZZLE_DAILY_SALT) >>> 0,
    difficulty: DAILY_PUZZLE_DIFFICULTY,
  }
}

// --- one-attempt-per-day guard (localStorage) ------------------------------

export interface PuzzleDailyOutcome {
  score: number
  seconds: number
  moves: number
  peeks: number
  /** True once this device has posted the score to the leaderboard. */
  posted?: boolean
}

const playedKey = (ymd: string) => `tinty.puzzle.daily.${ymd}`

export function getPuzzleDailyResult(ymd: string): PuzzleDailyOutcome | null {
  try {
    const raw = localStorage.getItem(playedKey(ymd))
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<PuzzleDailyOutcome> | null
    if (
      p &&
      typeof p.score === 'number' &&
      typeof p.seconds === 'number' &&
      typeof p.moves === 'number'
    ) {
      return { peeks: 0, ...p } as PuzzleDailyOutcome
    }
    return null
  } catch {
    return null
  }
}

function writeDaily(ymd: string, outcome: PuzzleDailyOutcome): void {
  try {
    localStorage.setItem(playedKey(ymd), JSON.stringify(outcome))
  } catch {
    // private mode / quota — the daily just won't be remembered
  }
}

export function markPuzzleDailyPlayed(ymd: string, outcome: PuzzleDailyOutcome): void {
  writeDaily(ymd, outcome)
}

/** Record that the score has been posted, so we don't offer to post again. */
export function markPuzzleDailyPosted(ymd: string): void {
  const current = getPuzzleDailyResult(ymd)
  if (current) writeDaily(ymd, { ...current, posted: true })
}
