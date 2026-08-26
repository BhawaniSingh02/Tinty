/**
 * Difficulty is chosen on the start screen and carried to a game via the
 * `?d=` query param.
 */
export type Difficulty = 'easy' | 'hard'

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'hard']

export const DEFAULT_DIFFICULTY: Difficulty = 'easy'

export function parseDifficulty(value: string | null | undefined): Difficulty {
  return value === 'hard' ? 'hard' : DEFAULT_DIFFICULTY
}

export interface DifficultyConfig {
  label: string
  /** How long the swatch is shown before it hides. */
  memorizeSeconds: number
  /**
   * Bounds for generated target colors (HSB, 0–100 for S/B). Hue is always the
   * full circle. Easy stays mid-range and colorful — easier to hold in memory
   * and to dial back in. Hard opens up greys and the dark/light extremes.
   */
  palette: { minS: number; maxS: number; minB: number; maxB: number }
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    memorizeSeconds: 4,
    palette: { minS: 35, maxS: 90, minB: 30, maxB: 85 },
  },
  hard: {
    label: 'Hard',
    memorizeSeconds: 2.5,
    palette: { minS: 0, maxS: 100, minB: 5, maxB: 100 },
  },
}
