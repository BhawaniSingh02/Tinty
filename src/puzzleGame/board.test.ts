import {
  correctCount,
  isSolved,
  isWellShuffled,
  minSwaps,
  shuffleQuality,
  shuffledBoard,
  solvedBoard,
  swapSlots,
} from './board.ts'
import { generatePuzzle } from './puzzle.ts'
import { PUZZLE_DIFFICULTIES, GRID_SIZE } from './difficulty.ts'
import { PUZZLE_IMAGES } from './images.ts'

test('solved board, swaps and correct count', () => {
  const b = solvedBoard(9)
  expect(isSolved(b)).toBe(true)
  expect(correctCount(b)).toBe(9)
  const s = swapSlots(b, 0, 8)
  expect(s).toEqual([8, 1, 2, 3, 4, 5, 6, 7, 0])
  expect(b).toEqual(solvedBoard(9)) // not mutated
  expect(correctCount(s)).toBe(7)
  expect(isSolved(swapSlots(s, 0, 8))).toBe(true)
})

test('minSwaps = tiles − cycles', () => {
  expect(minSwaps(solvedBoard(9))).toBe(0)
  expect(minSwaps([1, 0, 2, 3])).toBe(1) // one 2-cycle
  expect(minSwaps([1, 2, 3, 0])).toBe(3) // one 4-cycle
  expect(minSwaps([1, 0, 3, 2])).toBe(2) // two 2-cycles
})

test('greedy "put a tile home" solving uses exactly minSwaps swaps', () => {
  for (let seed = 1; seed < 50; seed++) {
    let board = shuffledBoard(4, seed)
    const expected = minSwaps(board)
    let swaps = 0
    for (let slot = 0; slot < board.length; slot++) {
      if (board[slot] !== slot) {
        board = swapSlots(board, slot, board.indexOf(slot))
        swaps++
      }
    }
    expect(isSolved(board)).toBe(true)
    expect(swaps).toBe(expected)
  }
})

test.each([3, 4, 5])('%i×%i shuffles are deterministic, valid and never near-solved', (size) => {
  const tiles = size * size
  const q = shuffleQuality(tiles)
  for (let seed = 0; seed < 300; seed++) {
    const board = shuffledBoard(size, seed)
    expect(shuffledBoard(size, seed)).toEqual(board)
    expect([...board].sort((a, b) => a - b)).toEqual(solvedBoard(tiles)) // a permutation
    expect(isSolved(board)).toBe(false)
    expect(isWellShuffled(board)).toBe(true)
    expect(correctCount(board)).toBeLessThanOrEqual(q.maxCorrect)
    expect(minSwaps(board)).toBeGreaterThanOrEqual(q.minSwaps)
  }
})

test('different seeds give different boards', () => {
  const seen = new Set<string>()
  for (let seed = 0; seed < 50; seed++) seen.add(shuffledBoard(4, seed).join(','))
  expect(seen.size).toBeGreaterThan(45)
})

test('generatePuzzle: same seed + difficulty → same image, board and optimum', () => {
  for (const d of PUZZLE_DIFFICULTIES) {
    const a = generatePuzzle(12345, d)
    const b = generatePuzzle(12345, d)
    expect(a.image.id).toBe(b.image.id)
    expect(a.board).toEqual(b.board)
    expect(a.size).toBe(GRID_SIZE[d])
    expect(a.board).toHaveLength(GRID_SIZE[d] ** 2)
    expect(a.optimal).toBe(minSwaps(a.board))
  }
})

test('seeds spread across the whole image library', () => {
  const ids = new Set<string>()
  for (let seed = 0; seed < 2000; seed++) ids.add(generatePuzzle(seed * 7919, 'easy').image.id)
  expect(ids.size).toBe(PUZZLE_IMAGES.length)
})
