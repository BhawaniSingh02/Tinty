import type { Hsb } from './color.ts'
import { mulberry32, randInt, type Rng } from './rng.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from './difficulty.ts'
import { ROUNDS } from './scoring.ts'

/** One target color for the given difficulty. Values are integer HSB. */
export function generateColor(rng: Rng, difficulty: Difficulty): Hsb {
  const { minS, maxS, minB, maxB } = DIFFICULTY_CONFIG[difficulty].palette
  return {
    h: randInt(rng, 0, 359),
    s: randInt(rng, minS, maxS),
    b: randInt(rng, minB, maxB),
  }
}

/**
 * The full set of target colors for a game. Deterministic: the same seed +
 * difficulty always produces the same colors, in the same order.
 */
export function generateRounds(
  seed: number,
  difficulty: Difficulty,
  count: number = ROUNDS,
): Hsb[] {
  const rng = mulberry32(seed)
  return Array.from({ length: count }, () => generateColor(rng, difficulty))
}
