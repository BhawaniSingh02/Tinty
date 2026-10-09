import { mulberry32, type Rng } from '../game/rng.ts'

/**
 * A board is a permutation: `board[slot] = piece`. Piece `i` belongs in slot
 * `i`, so the solved board is `[0, 1, 2, …]`.
 *
 * The mechanic is swap-based (tap two tiles, they trade places), and any
 * permutation can be sorted with swaps — so every shuffle is solvable. The
 * fewest swaps needed is `tiles − cycles` (each cycle of length k takes k − 1
 * swaps), which is the "optimal moves" the scoring compares against.
 */
export type Board = number[]

export const solvedBoard = (tiles: number): Board =>
  Array.from({ length: tiles }, (_, i) => i)

export const isSolved = (board: readonly number[]): boolean =>
  board.every((piece, slot) => piece === slot)

export const correctCount = (board: readonly number[]): number =>
  board.reduce((n, piece, slot) => n + (piece === slot ? 1 : 0), 0)

/** Swap two slots. Returns a new board; same board back if a === b. */
export function swapSlots(board: readonly number[], a: number, b: number): Board {
  const next = [...board]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/** Fewest swaps that solve the board: tiles − number of permutation cycles. */
export function minSwaps(board: readonly number[]): number {
  const seen = new Array<boolean>(board.length).fill(false)
  let cycles = 0
  for (let i = 0; i < board.length; i++) {
    if (seen[i]) continue
    cycles++
    for (let j = i; !seen[j]; j = board[j]) seen[j] = true
  }
  return board.length - cycles
}

/**
 * "Non-trivially shuffled": at most ~15% of tiles start home (at most 1 on a
 * 3×3) and the board needs at least ~75% of the maximum possible swaps
 * (tiles − 1) to solve. Most random permutations clear this; we just re-roll
 * the near-solved draws.
 */
export function shuffleQuality(tiles: number) {
  return {
    maxCorrect: Math.max(1, Math.floor(tiles * 0.15)),
    minSwaps: Math.ceil((tiles - 1) * 0.75),
  }
}

export function isWellShuffled(board: readonly number[]): boolean {
  const q = shuffleQuality(board.length)
  return correctCount(board) <= q.maxCorrect && minSwaps(board) >= q.minSwaps
}

function fisherYates(tiles: number, rng: Rng): Board {
  const out = solvedBoard(tiles)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Deterministic shuffle for a seed: same seed + size → same board, on every
 * device (daily, challenge links, live rooms all rely on this).
 */
export function shuffledBoard(size: number, seed: number): Board {
  const tiles = size * size
  const rng = mulberry32(seed ^ 0x5eed)
  for (let attempt = 0; attempt < 500; attempt++) {
    const board = fisherYates(tiles, rng)
    if (isWellShuffled(board)) return board
  }
  // Unreachable in practice — fall back to a rotation (a single full cycle:
  // zero tiles home, tiles − 1 swaps to solve).
  return solvedBoard(tiles).map((i) => (i + 1) % tiles)
}
