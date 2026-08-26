import {
  activeStreak,
  clearStats,
  loadStats,
  personalBest,
  recordGame,
} from './storage.ts'

beforeEach(() => {
  localStorage.clear()
})

const day = (ymd: string) => new Date(`${ymd}T12:00:00Z`)
const storedKey = () =>
  Object.keys(localStorage).find((k) => k.startsWith('_'))!

describe('loadStats', () => {
  test('zeroed defaults when nothing is stored', () => {
    expect(loadStats()).toEqual({
      best: { easy: 0, hard: 0 },
      streak: { current: 0, longest: 0, lastPlayedYmd: null },
      gamesPlayed: 0,
      history: [],
    })
  })

  test('falls back to defaults when the stored value is corrupt', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 30 }, day('2026-08-26'))
    localStorage.setItem(storedKey(), 'not-even-json')
    expect(loadStats().gamesPlayed).toBe(0)
  })
})

describe('recordGame — best score', () => {
  test('keeps the higher score, per difficulty', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 30 }, day('2026-08-26'))
    recordGame({ seed: 2, difficulty: 'easy', score: 22 }, day('2026-08-26'))
    expect(personalBest('easy')).toBe(30)
    recordGame({ seed: 3, difficulty: 'easy', score: 41 }, day('2026-08-26'))
    expect(personalBest('easy')).toBe(41)
  })

  test('easy and hard bests are independent', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 40 }, day('2026-08-26'))
    recordGame({ seed: 2, difficulty: 'hard', score: 15 }, day('2026-08-26'))
    expect(personalBest('easy')).toBe(40)
    expect(personalBest('hard')).toBe(15)
  })

  test('reports previousBest and isNewBest', () => {
    expect(
      recordGame({ seed: 1, difficulty: 'easy', score: 20 }, day('2026-08-26')),
    ).toMatchObject({ isNewBest: true, previousBest: 0 })
    expect(
      recordGame({ seed: 2, difficulty: 'easy', score: 18 }, day('2026-08-26')),
    ).toMatchObject({ isNewBest: false, previousBest: 20 })
  })

  test('clamps scores to 0–50', () => {
    const o = recordGame(
      { seed: 1, difficulty: 'easy', score: 999 },
      day('2026-08-26'),
    )
    expect(o.score).toBe(50)
    expect(personalBest('easy')).toBe(50)
  })
})

describe('recordGame — streak', () => {
  test('first game starts a 1-day streak', () => {
    const o = recordGame(
      { seed: 1, difficulty: 'easy', score: 10 },
      day('2026-08-26'),
    )
    expect(o.stats.streak).toEqual({
      current: 1,
      longest: 1,
      lastPlayedYmd: '2026-08-26',
    })
  })

  test('a second game the same day does not bump the streak', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 10 }, day('2026-08-26'))
    const o = recordGame(
      { seed: 2, difficulty: 'easy', score: 12 },
      day('2026-08-26'),
    )
    expect(o.stats.streak.current).toBe(1)
    expect(o.stats.gamesPlayed).toBe(2)
  })

  test('consecutive days grow it', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 10 }, day('2026-08-26'))
    recordGame({ seed: 2, difficulty: 'easy', score: 10 }, day('2026-08-27'))
    const o = recordGame(
      { seed: 3, difficulty: 'easy', score: 10 },
      day('2026-08-28'),
    )
    expect(o.stats.streak).toMatchObject({ current: 3, longest: 3 })
  })

  test('a missed day resets current but keeps longest', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 10 }, day('2026-08-26'))
    recordGame({ seed: 2, difficulty: 'easy', score: 10 }, day('2026-08-27'))
    const o = recordGame(
      { seed: 3, difficulty: 'easy', score: 10 },
      day('2026-08-30'),
    )
    expect(o.stats.streak).toMatchObject({ current: 1, longest: 2 })
  })
})

describe('activeStreak', () => {
  test('counts when the last play was today or yesterday, else 0', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 10 }, day('2026-08-26'))
    recordGame({ seed: 2, difficulty: 'easy', score: 10 }, day('2026-08-27'))
    const stats = loadStats()
    expect(activeStreak(stats, day('2026-08-27'))).toBe(2)
    expect(activeStreak(stats, day('2026-08-28'))).toBe(2)
    expect(activeStreak(stats, day('2026-08-29'))).toBe(0)
  })
})

describe('history', () => {
  test('newest first, capped at 10', () => {
    for (let i = 0; i < 14; i++) {
      recordGame({ seed: i, difficulty: 'easy', score: i }, day('2026-08-26'))
    }
    const h = loadStats().history
    expect(h).toHaveLength(10)
    expect(h[0].score).toBe(13)
    expect(h[9].score).toBe(4)
  })
})

describe('obfuscation', () => {
  test('key is a hash and the value is not plain / base64-decodable JSON', () => {
    recordGame({ seed: 1, difficulty: 'easy', score: 33 }, day('2026-08-26'))
    const key = storedKey()
    expect(key).not.toContain('tinty')

    const env = JSON.parse(localStorage.getItem(key)!)
    expect(env).toHaveProperty('value')
    expect(env).toHaveProperty('created')
    expect(() => JSON.parse(String(env.value))).toThrow()
    expect(() => JSON.parse(atob(String(env.value)))).toThrow()
  })

  test('round-trips through encode/decode', () => {
    recordGame({ seed: 1, difficulty: 'hard', score: 27 }, day('2026-08-26'))
    expect(loadStats()).toMatchObject({
      best: { hard: 27 },
      gamesPlayed: 1,
      history: [{ score: 27, difficulty: 'hard', ymd: '2026-08-26' }],
    })
  })
})

test('clearStats wipes everything', () => {
  recordGame({ seed: 1, difficulty: 'easy', score: 40 }, day('2026-08-26'))
  clearStats()
  expect(loadStats().gamesPlayed).toBe(0)
})
