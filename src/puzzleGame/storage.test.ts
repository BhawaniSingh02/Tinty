import { loadPuzzleStats, puzzleActiveStreak, recordPuzzleGame } from './storage.ts'
import {
  getPuzzleDailyResult,
  markPuzzleDailyPlayed,
  markPuzzleDailyPosted,
  todayPuzzleDaily,
} from './daily.ts'
import { todayDaily } from '../game/daily.ts'
import { todayPriceDaily } from '../priceGame/daily.ts'

beforeEach(() => localStorage.clear())

test('fresh stats are empty', () => {
  const s = loadPuzzleStats()
  expect(s.best).toEqual({ easy: 0, medium: 0, hard: 0 })
  expect(s.completed).toEqual([])
  expect(s.gamesPlayed).toBe(0)
})

test('bests are tracked per grid size', () => {
  const day = new Date('2026-10-09T12:00:00Z')
  const a = recordPuzzleGame({ score: 7.5, difficulty: 'easy', imageId: 'nature-a' }, day)
  expect(a.isNewBest).toBe(true)
  const b = recordPuzzleGame({ score: 6, difficulty: 'easy', imageId: 'nature-b' }, day)
  expect(b.isNewBest).toBe(false)
  expect(b.previousBest).toBe(7.5)
  const c = recordPuzzleGame({ score: 4, difficulty: 'hard', imageId: 'nature-a' }, day)
  expect(c.isNewBest).toBe(true)
  expect(loadPuzzleStats().best).toEqual({ easy: 7.5, medium: 0, hard: 4 })
  expect(loadPuzzleStats().gamesPlayed).toBe(3)
})

test('gallery records each image once', () => {
  const first = recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'space-x' })
  expect(first.newInGallery).toBe(true)
  const again = recordPuzzleGame({ score: 5, difficulty: 'hard', imageId: 'space-x' })
  expect(again.newInGallery).toBe(false)
  recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'food-y' })
  expect(loadPuzzleStats().completed).toEqual(['space-x', 'food-y'])
})

test('streak counts consecutive UTC days', () => {
  const d = (s: string) => new Date(`${s}T10:00:00Z`)
  recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'a' }, d('2026-10-07'))
  recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'a' }, d('2026-10-08'))
  recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'a' }, d('2026-10-08'))
  const out = recordPuzzleGame({ score: 5, difficulty: 'easy', imageId: 'a' }, d('2026-10-09'))
  expect(puzzleActiveStreak(out.stats, d('2026-10-09'))).toBe(3)
  expect(puzzleActiveStreak(out.stats, d('2026-10-10'))).toBe(3) // not broken until a day is missed
  expect(puzzleActiveStreak(out.stats, d('2026-10-11'))).toBe(0)
})

test('stats are not stored under a plain key', () => {
  recordPuzzleGame({ score: 9, difficulty: 'medium', imageId: 'a' })
  const keys = Object.keys(localStorage)
  expect(keys).toHaveLength(1)
  expect(keys[0]).not.toMatch(/puzzle|tinty|best/i)
  const env = JSON.parse(localStorage.getItem(keys[0])!)
  expect(env).toHaveProperty('value')
  expect(env).toHaveProperty('created')
  expect(env.value).not.toMatch(/medium|best|completed/)
})

test('corrupted storage falls back to defaults', () => {
  recordPuzzleGame({ score: 9, difficulty: 'medium', imageId: 'a' })
  const key = Object.keys(localStorage)[0]
  localStorage.setItem(key, '{"value":"%%%not-base64"}')
  expect(loadPuzzleStats().best.medium).toBe(0)
})

test('daily: same seed for everyone, distinct from the other dailies, resets at UTC midnight', () => {
  const t = new Date('2026-10-09T23:59:00Z')
  const a = todayPuzzleDaily(t)
  expect(todayPuzzleDaily(new Date('2026-10-09T00:00:01Z')).seed).toBe(a.seed)
  expect(todayPuzzleDaily(new Date('2026-10-10T00:00:01Z')).seed).not.toBe(a.seed)
  expect(a.seed).not.toBe(todayDaily(t).seed)
  expect(a.seed).not.toBe(todayPriceDaily(t).seed)
  expect(a.difficulty).toBe('medium')
})

test('daily: one attempt, posted flag', () => {
  expect(getPuzzleDailyResult('2026-10-09')).toBeNull()
  markPuzzleDailyPlayed('2026-10-09', { score: 7.2, seconds: 80, moves: 17, peeks: 1 })
  expect(getPuzzleDailyResult('2026-10-09')).toMatchObject({ score: 7.2, moves: 17 })
  expect(getPuzzleDailyResult('2026-10-09')?.posted).toBeUndefined()
  markPuzzleDailyPosted('2026-10-09')
  expect(getPuzzleDailyResult('2026-10-09')?.posted).toBe(true)
})
