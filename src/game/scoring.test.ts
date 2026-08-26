import {
  DELTA_E_ZERO,
  MAX_POINTS_PER_ROUND,
  MAX_SCORE,
  pointsForDeltaE,
  scoreRound,
  totalScore,
} from './scoring.ts'

describe('pointsForDeltaE', () => {
  test('ΔE 0 → full points', () => {
    expect(pointsForDeltaE(0)).toBe(MAX_POINTS_PER_ROUND)
  })

  test('ΔE at/above the zero threshold → 0', () => {
    expect(pointsForDeltaE(DELTA_E_ZERO)).toBe(0)
    expect(pointsForDeltaE(DELTA_E_ZERO + 10)).toBe(0)
    expect(pointsForDeltaE(999)).toBe(0)
  })

  test('negative ΔE is treated as 0', () => {
    expect(pointsForDeltaE(-5)).toBe(MAX_POINTS_PER_ROUND)
  })

  test('monotonically decreasing', () => {
    let prev = Infinity
    for (let dE = 0; dE <= DELTA_E_ZERO; dE += 0.5) {
      const p = pointsForDeltaE(dE)
      expect(p).toBeLessThanOrEqual(prev)
      prev = p
    }
  })

  test('halfway is half points (linear)', () => {
    expect(pointsForDeltaE(DELTA_E_ZERO / 2)).toBeCloseTo(
      MAX_POINTS_PER_ROUND / 2,
      2,
    )
  })

  test('rounded to 2 decimals', () => {
    const p = pointsForDeltaE(3.7)
    expect(p).toBe(Math.round(p * 100) / 100)
  })
})

describe('scoreRound', () => {
  test('identical color → 10', () => {
    const c = { h: 210, s: 60, b: 55 }
    expect(scoreRound(c, c)).toBe(10)
  })

  test('complementary hue at full saturation → 0', () => {
    expect(scoreRound({ h: 120, s: 90, b: 60 }, { h: 300, s: 90, b: 60 })).toBe(
      0,
    )
  })

  test('hue error matters far less at low saturation than at high', () => {
    const sameHueGap = (s: number) =>
      scoreRound({ h: 30, s, b: 70 }, { h: 90, s, b: 70 })
    // a 60° hue miss on near-greys barely dents the score...
    expect(sameHueGap(5)).toBeGreaterThan(7)
    // ...but the same miss on vivid colors is punishing.
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
