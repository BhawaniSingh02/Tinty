import { generateColor, generateRounds } from './palette.ts'
import { DIFFICULTY_CONFIG } from './difficulty.ts'
import { mulberry32 } from './rng.ts'
import { ROUNDS } from './scoring.ts'

describe('generateRounds', () => {
  test('deterministic: same seed + difficulty → same colors', () => {
    expect(generateRounds(555, 'easy')).toEqual(generateRounds(555, 'easy'))
  })

  test('seed and difficulty both change the result', () => {
    expect(generateRounds(555, 'easy')).not.toEqual(generateRounds(556, 'easy'))
    expect(generateRounds(555, 'easy')).not.toEqual(generateRounds(555, 'hard'))
  })

  test('produces ROUNDS colors with in-gamut HSB', () => {
    for (const c of generateRounds(42, 'hard')) {
      expect(c.h).toBeGreaterThanOrEqual(0)
      expect(c.h).toBeLessThanOrEqual(359)
      expect(c.s).toBeGreaterThanOrEqual(0)
      expect(c.s).toBeLessThanOrEqual(100)
      expect(c.b).toBeGreaterThanOrEqual(0)
      expect(c.b).toBeLessThanOrEqual(100)
      expect(Number.isInteger(c.h)).toBe(true)
      expect(Number.isInteger(c.s)).toBe(true)
      expect(Number.isInteger(c.b)).toBe(true)
    }
    expect(generateRounds(42, 'hard')).toHaveLength(ROUNDS)
  })

  test('custom count', () => {
    expect(generateRounds(1, 'easy', 3)).toHaveLength(3)
  })
})

describe('difficulty palette bounds', () => {
  const sample = (difficulty: 'easy' | 'hard') => {
    const rng = mulberry32(2024)
    return Array.from({ length: 3000 }, () => generateColor(rng, difficulty))
  }

  test('easy stays within its configured S/B window', () => {
    const { minS, maxS, minB, maxB } = DIFFICULTY_CONFIG.easy.palette
    for (const c of sample('easy')) {
      expect(c.s).toBeGreaterThanOrEqual(minS)
      expect(c.s).toBeLessThanOrEqual(maxS)
      expect(c.b).toBeGreaterThanOrEqual(minB)
      expect(c.b).toBeLessThanOrEqual(maxB)
    }
  })

  test('hard reaches greys and the dark/light extremes that easy never does', () => {
    const hard = sample('hard')
    expect(hard.some((c) => c.s < DIFFICULTY_CONFIG.easy.palette.minS)).toBe(true)
    expect(hard.some((c) => c.b < DIFFICULTY_CONFIG.easy.palette.minB)).toBe(true)
    expect(hard.some((c) => c.b > DIFFICULTY_CONFIG.easy.palette.maxB)).toBe(true)
  })
})
