import { formatClock, moveFactor, scorePuzzle, timeFactor, type PuzzleSolve } from './scoring.ts'

const solve = (over: Partial<PuzzleSolve>): PuzzleSolve => ({
  difficulty: 'medium',
  seconds: 60,
  moves: 13,
  optimal: 13,
  peeks: 0,
  ...over,
})

test('an instant, optimal, no-peek solve is a 10', () => {
  expect(scorePuzzle(solve({ seconds: 5 }))).toBe(10)
})

test('score is always within 0–10 with 2 decimals', () => {
  for (const seconds of [0, 10, 60, 300, 3600]) {
    for (const moves of [13, 20, 50, 400]) {
      for (const peeks of [0, 1, 5, 40]) {
        const s = scorePuzzle(solve({ seconds, moves, peeks }))
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(10)
        expect(Math.round(s * 100) / 100).toBe(s)
      }
    }
  }
})

test('slower → lower, smoothly (no stepped brackets)', () => {
  let prev = Infinity
  for (let t = 15; t <= 400; t += 1) {
    const s = scorePuzzle(solve({ seconds: t }))
    expect(s).toBeLessThanOrEqual(prev)
    // one extra second never costs more than a sliver
    if (prev !== Infinity) expect(prev - s).toBeLessThan(0.1)
    prev = s
  }
})

test('more moves → lower, smoothly', () => {
  let prev = Infinity
  for (let m = 13; m <= 60; m++) {
    const s = scorePuzzle(solve({ moves: m }))
    expect(s).toBeLessThanOrEqual(prev)
    if (prev !== Infinity) expect(prev - s).toBeLessThan(0.5)
    prev = s
  }
})

test('each peek is a small penalty', () => {
  const base = scorePuzzle(solve({}))
  const one = scorePuzzle(solve({ peeks: 1 }))
  const two = scorePuzzle(solve({ peeks: 2 }))
  expect(base - one).toBeGreaterThan(0.3)
  expect(base - one).toBeLessThan(1)
  expect(two).toBeLessThan(one)
})

test('time expectations scale with grid size', () => {
  // The same clock time is a great 5×5 but a slow 3×3.
  expect(timeFactor('hard', 90)).toBeGreaterThan(timeFactor('medium', 90))
  expect(timeFactor('medium', 90)).toBeGreaterThan(timeFactor('easy', 90))
  // A "fast" solve for each size lands in the same band.
  const fast = [
    scorePuzzle({ difficulty: 'easy', seconds: 20, moves: 8, optimal: 7, peeks: 0 }),
    scorePuzzle({ difficulty: 'medium', seconds: 50, moves: 15, optimal: 13, peeks: 0 }),
    scorePuzzle({ difficulty: 'hard', seconds: 100, moves: 24, optimal: 21, peeks: 0 }),
  ]
  for (const s of fast) expect(s).toBeGreaterThan(8.8)
})

test('moves are judged relative to the board optimum', () => {
  expect(moveFactor(13, 13)).toBe(1)
  expect(moveFactor(10, 13)).toBe(1) // can't beat optimal, but never penalised
  expect(moveFactor(26, 13)).toBeCloseTo(moveFactor(14, 7), 10)
})

test('sanity bands from the example table', () => {
  // fast + few moves
  expect(scorePuzzle({ difficulty: 'easy', seconds: 20, moves: 8, optimal: 7, peeks: 0 })).toBeGreaterThan(9)
  // medium time, some extra moves
  const mid = scorePuzzle({ difficulty: 'medium', seconds: 110, moves: 21, optimal: 13, peeks: 0 })
  expect(mid).toBeGreaterThan(6)
  expect(mid).toBeLessThan(7.5)
  // slow + many moves
  const slow = scorePuzzle({ difficulty: 'hard', seconds: 400, moves: 42, optimal: 21, peeks: 0 })
  expect(slow).toBeGreaterThan(2.5)
  expect(slow).toBeLessThan(4.5)
})

test('formatClock', () => {
  expect(formatClock(0)).toBe('0:00')
  expect(formatClock(7.9)).toBe('0:07')
  expect(formatClock(83)).toBe('1:23')
  expect(formatClock(600)).toBe('10:00')
})
