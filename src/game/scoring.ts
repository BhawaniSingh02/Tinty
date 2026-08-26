import { hsbToLab, type Hsb } from './color.ts'
import { deltaE2000 } from './deltaE.ts'

export const ROUNDS = 5
export const MAX_POINTS_PER_ROUND = 10
export const MAX_SCORE = ROUNDS * MAX_POINTS_PER_ROUND // 50

/**
 * Scoring curve: ΔE00 → points (0…10).
 *
 *   points = MAX * clamp(1 - ΔE / DELTA_E_ZERO, 0, 1) ^ SCORING_EXPONENT
 *
 * ΔE 0 → 10.00 · ΔE ≥ DELTA_E_ZERO → 0.00 · linear in between (exponent 1).
 * These constants set the whole game's feel — tune after the first real
 * playtest (CLAUDE.md flags this as an open decision).
 */
export const DELTA_E_ZERO = 25
export const SCORING_EXPONENT = 1

/** Points (0–10, 2 dp) for a ΔE00 value. */
export function pointsForDeltaE(deltaE: number): number {
  const closeness = Math.max(0, 1 - Math.max(0, deltaE) / DELTA_E_ZERO)
  return round2(MAX_POINTS_PER_ROUND * closeness ** SCORING_EXPONENT)
}

/** Points (0–10, 2 dp) for a guess vs the target — both HSB. */
export function scoreRound(target: Hsb, guess: Hsb): number {
  return pointsForDeltaE(deltaE2000(hsbToLab(target), hsbToLab(guess)))
}

/** Sum of round points (0–50, 2 dp). */
export function totalScore(roundPoints: readonly number[]): number {
  return round2(roundPoints.reduce((sum, p) => sum + p, 0))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
