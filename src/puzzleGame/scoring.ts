import type { PuzzleDifficulty } from './difficulty.ts'

export const MAX_SCORE = 10

/**
 * Picture Puzzle scoring — one puzzle, scored out of 10 from time, moves and
 * peeks. Same family of curve as Color Match / Price Guess: a smooth
 * stretched-exponential decay with a flat top, no stepped brackets.
 *
 *   time   t' = max(0, seconds − GRACE)                (GRACE = a few free seconds)
 *          timeFactor = exp( −(t' / TIME_FALLOFF) ^ TIME_SHARPNESS )
 *   moves  extra = (moves − optimal) / optimal          (0 = a perfect solve)
 *          moveFactor = exp( −(extra / MOVE_FALLOFF) ^ MOVE_SHARPNESS )
 *   peeks  peekFactor = PEEK_FACTOR ^ peeks
 *
 *   points = 10 · timeFactor^TIME_WEIGHT · moveFactor^MOVE_WEIGHT · peekFactor
 *
 * A weighted *geometric* mean, so both matter: a lightning solve that wastes
 * twice the swaps doesn't score 10, and a perfect-moves solve that took
 * forever doesn't either. Time carries a bit more weight — it's the thing
 * players feel.
 *
 * Moves are relative to `optimal` — the fewest swaps that solve *this* board
 * (see board.ts `minSwaps`), so a lucky or unlucky shuffle doesn't move the
 * goalposts, and every grid size uses the same move curve.
 *
 * Time is scaled per difficulty (a 5×5 naturally takes far longer than a
 * 3×3): TIME_FALLOFF is roughly "a slow-ish solve" for that grid, where the
 * time factor has dropped to ~37%.
 *
 * Constants tuned (see scoring.test.ts + scripts/scoring-examples.mjs) —
 * retune after the first real playtest.
 */
export interface PuzzleTimeCurve {
  /** Seconds that are free — roughly the physical minimum to tap it out. */
  grace: number
  /** Seconds past grace where the time factor falls to 1/e. */
  falloff: number
}

export const TIME_CURVE: Record<PuzzleDifficulty, PuzzleTimeCurve> = {
  easy: { grace: 6, falloff: 75 },
  medium: { grace: 14, falloff: 170 },
  hard: { grace: 24, falloff: 320 },
}

export const TIME_SHARPNESS = 1.5
export const MOVE_FALLOFF = 1.25
export const MOVE_SHARPNESS = 1.4
export const TIME_WEIGHT = 0.6
export const MOVE_WEIGHT = 0.4
/** Each peek keeps 93% of the score — about −0.7 off a strong solve. */
export const PEEK_FACTOR = 0.93

export interface PuzzleSolve {
  difficulty: PuzzleDifficulty
  seconds: number
  moves: number
  /** Fewest swaps that solve the starting board. */
  optimal: number
  peeks: number
}

export function timeFactor(difficulty: PuzzleDifficulty, seconds: number): number {
  const { grace, falloff } = TIME_CURVE[difficulty]
  const t = Math.max(0, seconds - grace)
  return Math.exp(-((t / falloff) ** TIME_SHARPNESS))
}

export function moveFactor(moves: number, optimal: number): number {
  if (optimal <= 0) return 1
  const extra = Math.max(0, moves - optimal) / optimal
  return Math.exp(-((extra / MOVE_FALLOFF) ** MOVE_SHARPNESS))
}

/** Points (0–10, 2 dp) for a finished puzzle. */
export function scorePuzzle(s: PuzzleSolve): number {
  const raw =
    MAX_SCORE *
    timeFactor(s.difficulty, s.seconds) ** TIME_WEIGHT *
    moveFactor(s.moves, s.optimal) ** MOVE_WEIGHT *
    PEEK_FACTOR ** Math.max(0, s.peeks)
  return raw < 0.05 ? 0 : round2(Math.min(MAX_SCORE, raw))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** 83 → "1:23" */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
