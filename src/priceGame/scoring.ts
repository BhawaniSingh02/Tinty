export const ROUNDS = 5
export const MAX_POINTS_PER_ROUND = 10
export const MAX_SCORE = ROUNDS * MAX_POINTS_PER_ROUND // 50

/**
 * Smooth percentage-error scoring for Price Check.
 *
 *   pctErr = |guess − actual| / actual            (0.25 → "25% off")
 *   points = 10 · exp( −(pctErr / FALLOFF) ^ SHARPNESS )
 *
 * Same shape as Color Match's ΔE curve (see game/scoring.ts): a continuous
 * decay with a flat top — SHARPNESS > 1 means a near-perfect guess barely
 * loses anything and there's no "perfect" bracket cliff — then it rolls off
 * once you're clearly wrong and tails to 0. No stepped brackets anywhere, so
 * $104 and $106 guesses on a $100 item score a hair apart, not 10 vs 8.
 *
 * Prices span perfume to cars, so error is always relative to the real price,
 * never a raw dollar gap.
 *
 * FALLOFF/SHARPNESS were widened 0.32/1.6 → 0.37/1.75 — same retune we did to
 * Color Match. The old curve was too harsh through the middle: a guess that's
 * clearly off but in the right ballpark (~25% out) scored ~5, which felt like a
 * near-fail. The wider falloff lifts that band ~1 point; the steeper exponent
 * keeps the deep-fail tail (75%+) just as punishing, so wild guesses still
 * score ~0. No hue/sat-style fudge, no jitter — purely a function of pctErr.
 *
 * Constants tuned (see scoring.test.ts + scripts/scoring-examples.mjs) so:
 *
 *    2% → 9.94      20% → 7.11      40% → 3.18
 *    5% → 9.70      25% → 6.04      50% → 1.84
 *   10% → 9.04      30% → 5.00      75% → 0.32
 *   15% → 8.14      33% → 4.41     ≥95% → 0.00
 *
 * Retune after the first real playtest.
 */
export const SCORE_FALLOFF = 0.37
export const SCORE_SHARPNESS = 1.75

/** Points (0–10, 2 dp) for a fractional price error (0.25 = 25% off). */
export function pointsForError(pctErr: number): number {
  const e = Math.max(0, pctErr)
  const raw =
    MAX_POINTS_PER_ROUND * Math.exp(-((e / SCORE_FALLOFF) ** SCORE_SHARPNESS))
  return raw < 0.1 ? 0 : round2(raw)
}

/** Points (0–10, 2 dp) for a guess vs the real price. */
export function scoreGuess(actual: number, guess: number): number {
  if (!(actual > 0)) return 0
  return pointsForError(Math.abs(guess - actual) / actual)
}

/** Sum of round points (0–50, 2 dp). */
export function totalScore(roundPoints: readonly number[]): number {
  return round2(roundPoints.reduce((sum, p) => sum + p, 0))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
