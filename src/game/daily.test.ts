import {
  formatDuration,
  getDailyResult,
  markDailyPlayed,
  msUntilReset,
  todayDaily,
} from './daily.ts'
import { dailySeed } from './rng.ts'

beforeEach(() => {
  localStorage.clear()
})

describe('todayDaily', () => {
  test('deterministic from the UTC date', () => {
    const d = new Date('2026-08-26T15:00:00Z')
    expect(todayDaily(d)).toEqual({
      ymd: '2026-08-26',
      seed: dailySeed(d),
      difficulty: 'easy',
    })
  })

  test('same UTC day, any time → same daily', () => {
    expect(todayDaily(new Date('2026-08-26T00:01:00Z'))).toEqual(
      todayDaily(new Date('2026-08-26T23:59:00Z')),
    )
  })
})

describe('msUntilReset', () => {
  test('counts down to the next 00:00 UTC', () => {
    expect(msUntilReset(new Date('2026-08-26T23:00:00Z'))).toBe(60 * 60 * 1000)
    expect(msUntilReset(new Date('2026-08-26T00:00:00Z'))).toBe(
      24 * 60 * 60 * 1000,
    )
  })
})

describe('formatDuration', () => {
  test.each([
    [0, '0m 00s'],
    [65_000, '1m 05s'],
    [3_661_000, '1h 01m 01s'],
    [-500, '0m 00s'],
  ])('%d ms → %s', (ms, out) => {
    expect(formatDuration(ms)).toBe(out)
  })
})

describe('one-attempt guard', () => {
  test('records and reads back the result', () => {
    expect(getDailyResult('2026-08-26')).toBeNull()
    const outcome = { score: 33.5, breakdown: [10, 8, 7.5, 5, 3] }
    markDailyPlayed('2026-08-26', outcome)
    expect(getDailyResult('2026-08-26')).toEqual(outcome)
  })

  test('ignores a corrupt value', () => {
    localStorage.setItem('tinty.daily.2026-08-26', '{ not json')
    expect(getDailyResult('2026-08-26')).toBeNull()
  })

  test('scoped per day', () => {
    markDailyPlayed('2026-08-26', { score: 10, breakdown: [] })
    expect(getDailyResult('2026-08-27')).toBeNull()
  })
})
