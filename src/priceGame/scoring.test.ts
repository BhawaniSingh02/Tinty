import {
  MAX_POINTS_PER_ROUND,
  MAX_SCORE,
  pointsForError,
  scoreGuess,
  totalScore,
} from './scoring.ts'

describe('pointsForError', () => {
  test('an exact guess is full marks; a near-perfect one is almost full', () => {
    expect(pointsForError(0)).toBe(MAX_POINTS_PER_ROUND)
    expect(pointsForError(-0.5)).toBe(MAX_POINTS_PER_ROUND)
    expect(pointsForError(0.01)).toBeGreaterThan(9.9)
    expect(pointsForError(0.02)).toBeGreaterThan(9.8)
  })

  test('hits the tuned anchors — 5% strong, 25% middling, wild guess → 0', () => {
    // Within 5%: still a strong score.
    expect(pointsForError(0.05)).toBeGreaterThan(9)
    expect(pointsForError(0.05)).toBeLessThanOrEqual(10)
    // ~25% off — "clearly wrong but in the ballpark" — middling, not a near-fail.
    expect(pointsForError(0.25)).toBeGreaterThan(5.5)
    expect(pointsForError(0.25)).toBeLessThan(6.7)
    // Deep-fail tail stays harsh: 75%+ is ~zero.
    expect(pointsForError(0.75)).toBeLessThan(0.5)
    expect(pointsForError(1)).toBe(0)
    expect(pointsForError(5)).toBe(0)
  })

  test('no bracket cliffs — crossing an old threshold barely moves the score', () => {
    // The old stepped curve jumped 10 → 8 at 5% and 5 → 2 at 25%. The smooth
    // curve moves by a fraction of a point across the same tiny spans.
    expect(pointsForError(0.049) - pointsForError(0.051)).toBeLessThan(0.05)
    expect(pointsForError(0.249) - pointsForError(0.251)).toBeLessThan(0.1)
  })

  test('score change stays proportional to error change — no jumps anywhere', () => {
    let maxStep = 0
    for (let e = 0; e < 1.5; e += 0.005) {
      maxStep = Math.max(maxStep, pointsForError(e) - pointsForError(e + 0.005))
    }
    // Half a point of extra % error never costs more than ~0.15 pts — vs the
    // old curve's 3-point cliff at the 25% boundary.
    expect(maxStep).toBeLessThan(0.15)
  })

  test('monotonically decreasing', () => {
    let prev = Infinity
    for (let e = 0; e <= 2; e += 0.01) {
      const p = pointsForError(e)
      expect(p).toBeLessThanOrEqual(prev)
      prev = p
    }
  })

  test('rounded to 2 decimals, never out of range', () => {
    for (const e of [0.03, 0.077, 0.19, 0.333, 0.5, 0.8]) {
      const p = pointsForError(e)
      expect(p).toBe(Math.round(p * 100) / 100)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(MAX_POINTS_PER_ROUND)
    }
  })
})

describe('scoreGuess', () => {
  test('exact guess → 10', () => {
    expect(scoreGuess(100, 100)).toBe(10)
  })

  test('relative, not absolute — same % off scores the same at any price tier', () => {
    // 10% off a $30 board game and a $90,000 car land on the same points.
    expect(scoreGuess(30, 33)).toBe(scoreGuess(90_000, 99_000))
    expect(scoreGuess(30, 33)).toBeLessThan(9.5)
  })

  test('symmetric — too high and too low score the same', () => {
    expect(scoreGuess(200, 220)).toBe(scoreGuess(200, 180))
  })

  test('a wild guess floors at 0, never negative', () => {
    expect(scoreGuess(100, 500)).toBe(0)
    expect(scoreGuess(100, 1)).toBe(0)
  })

  test('guards a missing / nonsense actual price', () => {
    expect(scoreGuess(0, 50)).toBe(0)
    expect(scoreGuess(-10, 50)).toBe(0)
  })
})

describe('totalScore', () => {
  test('sums rounds, rounded to 2 dp, max is 50', () => {
    expect(totalScore([10, 10, 10, 10, 10])).toBe(MAX_SCORE)
    expect(totalScore([9.5, 5.1, 8.56, 0, 2.4])).toBe(25.56)
  })
})
