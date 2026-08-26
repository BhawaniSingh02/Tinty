import {
  SEED_SPACE,
  codeToSeed,
  dailyCode,
  dailySeed,
  mulberry32,
  randInt,
  randomSeed,
  seedToCode,
} from './rng.ts'

describe('mulberry32', () => {
  test('same seed → identical sequence', () => {
    const a = Array.from({ length: 20 }, mulberry32(12345))
    const b = Array.from({ length: 20 }, mulberry32(12345))
    expect(a).toEqual(b)
  })

  test('different seeds → different sequence', () => {
    const a = Array.from({ length: 20 }, mulberry32(1))
    const b = Array.from({ length: 20 }, mulberry32(2))
    expect(a).not.toEqual(b)
  })

  test('values are in [0, 1)', () => {
    const rng = mulberry32(999)
    for (let i = 0; i < 5000; i++) {
      const n = rng()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })

  test('randInt covers its inclusive range', () => {
    const rng = mulberry32(7)
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) seen.add(randInt(rng, 1, 6))
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('seedToCode / codeToSeed', () => {
  test('round-trips across the seed space', () => {
    for (const seed of [0, 1, 42, 1000, 123456, SEED_SPACE - 1, randomSeed()]) {
      const code = seedToCode(seed)
      expect(code).toHaveLength(6)
      expect(code).toMatch(/^[0-9a-z]{6}$/)
      expect(codeToSeed(code)).toBe(seed)
    }
  })

  test('codeToSeed rejects malformed input', () => {
    for (const bad of ['', 'abc', 'abcdefg', 'ABC!23', 'zzzzzzz', '  ', '12 34']) {
      expect(codeToSeed(bad)).toBeNull()
    }
  })

  test('codeToSeed is case-insensitive and trims', () => {
    const code = seedToCode(98765)
    expect(codeToSeed(`  ${code.toUpperCase()}  `)).toBe(98765)
  })

  test('randomSeed stays in range', () => {
    for (let i = 0; i < 1000; i++) {
      const s = randomSeed()
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThan(SEED_SPACE)
    }
  })
})

describe('dailySeed', () => {
  test('same UTC date → same seed, regardless of time of day', () => {
    const morning = new Date('2026-08-26T00:00:01Z')
    const evening = new Date('2026-08-26T23:59:59Z')
    expect(dailySeed(morning)).toBe(dailySeed(evening))
  })

  test('consecutive days differ', () => {
    const d1 = dailySeed(new Date('2026-08-26T12:00:00Z'))
    const d2 = dailySeed(new Date('2026-08-27T12:00:00Z'))
    const d3 = dailySeed(new Date('2026-08-28T12:00:00Z'))
    expect(new Set([d1, d2, d3]).size).toBe(3)
  })

  test('seed is in range and code is valid', () => {
    const d = new Date('2026-08-26T12:00:00Z')
    expect(dailySeed(d)).toBeLessThan(SEED_SPACE)
    expect(dailyCode(d)).toMatch(/^[0-9a-z]{6}$/)
  })
})
