import {
  MAX_POINTS_PER_ROUND,
  MAX_SCORE,
  pointsForDeltaE,
  scoreRound,
  totalScore,
} from './scoring.ts'

describe('pointsForDeltaE', () => {
  test('an imperceptible miss (ΔE ≤ ~1) is full marks', () => {
    expect(pointsForDeltaE(0)).toBe(MAX_POINTS_PER_ROUND)
    expect(pointsForDeltaE(-5)).toBe(MAX_POINTS_PER_ROUND)
    expect(pointsForDeltaE(0.5)).toBe(MAX_POINTS_PER_ROUND)
  })

  test('a barely-noticeable miss barely costs anything', () => {
    expect(pointsForDeltaE(2)).toBeGreaterThan(9.5)
    expect(pointsForDeltaE(3.5)).toBeGreaterThan(9)
  })

  test('mid-range is forgiving (retuned against dialed.gg), tail still dies off', () => {
    // ΔE00 ~10 is "close but off" — should sit in the 8s, not the 6s.
    expect(pointsForDeltaE(10)).toBeGreaterThan(7.5)
    expect(pointsForDeltaE(10)).toBeLessThan(9)
    // ΔE00 ~25 is "same family, clearly wrong" — near half marks.
    expect(pointsForDeltaE(25)).toBeGreaterThan(4)
    expect(pointsForDeltaE(25)).toBeLessThan(6)
    // Far out still tails toward zero.
    expect(pointsForDeltaE(45)).toBeLessThan(3)
    expect(pointsForDeltaE(999)).toBe(0)
  })

  test('monotonically decreasing', () => {
    let prev = Infinity
    for (let dE = 0; dE <= 60; dE += 0.5) {
      const p = pointsForDeltaE(dE)
      expect(p).toBeLessThanOrEqual(prev)
      prev = p
    }
  })

  test('rounded to 2 decimals', () => {
    const p = pointsForDeltaE(7.3)
    expect(p).toBe(Math.round(p * 100) / 100)
  })
})

describe('scoreRound', () => {
  test('identical color → 10', () => {
    const c = { h: 210, s: 60, b: 55 }
    expect(scoreRound(c, c)).toBe(10)
  })

  test('complementary hue at full saturation scores near zero', () => {
    // ΔE00 ≈ 90. The retuned curve is gentler, so this bottoms out just above
    // 0 rather than clamping to it — still a decisive fail.
    expect(
      scoreRound({ h: 120, s: 90, b: 60 }, { h: 300, s: 90, b: 60 }),
    ).toBeLessThan(0.5)
  })

  test('hue error matters far less at low saturation than at high', () => {
    const sameHueGap = (s: number) =>
      scoreRound({ h: 30, s, b: 70 }, { h: 90, s, b: 70 })
    expect(sameHueGap(5)).toBeGreaterThan(7)
    expect(sameHueGap(5)).toBeGreaterThan(sameHueGap(85) + 3)
  })
})

describe('totalScore', () => {
  test('sums rounds', () => {
    expect(totalScore([10, 8.5, 7.25, 0, 4.1])).toBe(29.85)
  })

  test('max is 50', () => {
    expect(totalScore([10, 10, 10, 10, 10])).toBe(MAX_SCORE)
  })
})
