import { mulberry32 } from '../game/rng.ts'
import { minSwaps, shuffledBoard, type Board } from './board.ts'
import { GRID_SIZE, type PuzzleDifficulty } from './difficulty.ts'
import { PUZZLE_IMAGES, type PuzzleImage } from './images.ts'

/**
 * Everything about a puzzle comes from one numeric seed + the difficulty —
 * the same seeded-RNG pattern as Color Match / Price Guess — so a seed can
 * ride in a challenge link, name a live room, or be the daily, and every
 * device builds the identical image + shuffle.
 */
export interface Puzzle {
  seed: number
  difficulty: PuzzleDifficulty
  size: number
  image: PuzzleImage
  /** Starting board: board[slot] = piece. */
  board: Board
  /** Fewest swaps that solve `board`. */
  optimal: number
}

/** A finished puzzle. */
export interface PuzzleResult {
  seed: number
  difficulty: PuzzleDifficulty
  imageId: string
  score: number
  seconds: number
  moves: number
  optimal: number
  peeks: number
}

export function generatePuzzle(
  seed: number,
  difficulty: PuzzleDifficulty,
  pool: readonly PuzzleImage[] = PUZZLE_IMAGES,
): Puzzle {
  const rng = mulberry32(seed)
  const image = pool[Math.floor(rng() * pool.length)]
  const size = GRID_SIZE[difficulty]
  const board = shuffledBoard(size, seed)
  return { seed, difficulty, size, image, board, optimal: minSwaps(board) }
}
