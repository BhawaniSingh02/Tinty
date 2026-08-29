export const ROUNDS = 5
export const MAX_POINTS_PER_ROUND = 10
export const MAX_SCORE = ROUNDS * MAX_POINTS_PER_ROUND // 50

/**
 * Percentage-based scoring (CLAUDE.md-style spec for Price Check): guesses are
 * compared as a fraction of the real price, not a raw difference, since a
 * single round set spans perfume to cars.
 *
 *   within  5%  → 10
 *   within 10%  →  8
 *   within 25%  →  5
 *   within 50%  →  2
 *   beyond      →  0
 */
export function scoreGuess(actual: number, guess: number): number {
  if (actual <= 0) return 0
  const pctOff = Math.abs(guess - actual) / actual
  if (pctOff <= 0.05) return 10
  if (pctOff <= 0.1) return 8
  if (pctOff <= 0.25) return 5
  if (pctOff <= 0.5) return 2
  return 0
}

export function totalScore(roundPoints: readonly number[]): number {
  return roundPoints.reduce((sum, p) => sum + p, 0)
}
