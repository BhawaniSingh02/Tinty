/**
 * Picture Puzzle difficulty = grid size. Chosen on the start screen and
 * carried to a game via the `?d=` query param (same as Color Match).
 */
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard'

export const PUZZLE_DIFFICULTIES: readonly PuzzleDifficulty[] = ['easy', 'medium', 'hard']

export const DEFAULT_PUZZLE_DIFFICULTY: PuzzleDifficulty = 'easy'

/** The daily is always the middle size — one board for everyone. */
export const DAILY_PUZZLE_DIFFICULTY: PuzzleDifficulty = 'medium'

export function parsePuzzleDifficulty(value: string | null | undefined): PuzzleDifficulty {
  return value === 'medium' || value === 'hard' ? value : DEFAULT_PUZZLE_DIFFICULTY
}

export const GRID_SIZE: Record<PuzzleDifficulty, number> = {
  easy: 3,
  medium: 4,
  hard: 5,
}

export const DIFFICULTY_LABEL: Record<PuzzleDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const gridLabel = (d: PuzzleDifficulty) => `${GRID_SIZE[d]}×${GRID_SIZE[d]}`

/** How long the full picture is shown before the board is shuffled. */
export const PREVIEW_SECONDS = 3
/** How long one peek shows the full picture during play. */
export const PEEK_SECONDS = 2
