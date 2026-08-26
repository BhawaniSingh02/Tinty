/**
 * Difficulty is chosen on the start screen and carried to a game via the
 * `?d=` query param. Full per-mode tuning (reveal time, palette range, scoring
 * threshold) is defined in build step 4 — this is just the identifier for now.
 */
export type Difficulty = 'easy' | 'hard'

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'hard']

export const DEFAULT_DIFFICULTY: Difficulty = 'easy'

export function parseDifficulty(value: string | null | undefined): Difficulty {
  return value === 'hard' ? 'hard' : DEFAULT_DIFFICULTY
}
