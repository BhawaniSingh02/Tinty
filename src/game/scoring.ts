import { hsbToLab, type Hsb } from './color.ts'
import { deltaE2000 } from './deltaE.ts'

export const ROUNDS = 5
export const MAX_POINTS_PER_ROUND = 10
export const MAX_SCORE = ROUNDS * MAX_POINTS_PER_ROUND // 50

/**
 * Perceptual scoring — ΔE00 → points (0…10).
 *
 *   points = 10 · exp( −(ΔE / FALLOFF) ^ SHARPNESS )
 *
 * ΔE00 ≈ 1 is the just-noticeable difference, so anything inside PERFECT_DE is
 * full marks. Past that the curve has a flat top (SHARPNESS > 1) — near-misses
 * barely cost anything — then rolls off once the colors are visibly apart and
 * tails to 0 for a wildly wrong guess.
 *
 * FALLOFF was widened 16 → 33 after checking our old curve against dialed.gg's
 * (their live formula, confirmed by inspection, is 10/(1+(ΔE/25.25)^1.55)). We
 * were far too harsh in the mid-range — a same-family-but-clearly-off guess
 * (ΔE00 ≈ 20–25) scored ~1.5 where it should sit near 5. This keeps our own
 * exponential shape, just gentler; no hue/sat fudge, no jitter — pure ΔE00.
 *
 *   ΔE   1  →  9.9      ΔE  13  →  7.6      ΔE  30  →  4.2
 *   ΔE   3  →  9.7      ΔE  17  →  6.7      ΔE  45  →  2.1
 *   ΔE   5  →  9.3      ΔE  20  →  6.1      ΔE  65  →  0.8
 *   ΔE  10  →  8.3      ΔE  25  →  5.1      ΔE ≥75  →  ~0
 */
export const SCORE_PERFECT_DE = 0.8
export const SCORE_FALLOFF = 33
export const SCORE_SHARPNESS = 1.4

/** Points (0–10, 2 dp) for a ΔE00 value. */
export function pointsForDeltaE(deltaE: number): number {
  const dE = Math.max(0, deltaE)
  if (dE <= SCORE_PERFECT_DE) return MAX_POINTS_PER_ROUND
  const raw =
    MAX_POINTS_PER_ROUND *
    Math.exp(-((dE / SCORE_FALLOFF) ** SCORE_SHARPNESS))
  return raw < 0.1 ? 0 : round2(raw)
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
