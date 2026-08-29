import { MAX_SCORE, scoreGuess, totalScore } from './scoring.ts'

describe('scoreGuess', () => {
  test('exact guess → 10', () => {
    expect(scoreGuess(100, 100)).toBe(10)
  })

  test('within 5% → 10', () => {
    expect(scoreGuess(100, 104)).toBe(10)
    expect(scoreGuess(100, 96)).toBe(10)
  })

  test('within 10% → 8', () => {
    expect(scoreGuess(100, 108)).toBe(8)
  })

  test('within 25% → 5', () => {
    expect(scoreGuess(100, 120)).toBe(5)
  })

  test('within 50% → 2', () => {
    expect(scoreGuess(100, 145)).toBe(2)
  })

  test('beyond 50% → 0', () => {
    expect(scoreGuess(100, 500)).toBe(0)
    expect(scoreGuess(100, 10)).toBe(0)
  })

  test('symmetric — too high and too low score the same', () => {
    expect(scoreGuess(200, 220)).toBe(scoreGuess(200, 180))
  })
})

describe('totalScore', () => {
  test('sums rounds, max is 50', () => {
    expect(totalScore([10, 10, 10, 10, 10])).toBe(MAX_SCORE)
    expect(totalScore([10, 8, 5, 2, 0])).toBe(25)
  })
})
