import {
  gameReducer,
  initialState,
  NEUTRAL_GUESS,
  type GameState,
} from './gameReducer.ts'
import type { Hsb } from './color.ts'

const target: Hsb = { h: 100, s: 50, b: 50 }

test('starts in reveal on round 0 with no results', () => {
  expect(initialState).toMatchObject({ phase: 'reveal', round: 0, results: [] })
})

test('reveal → recall resets the guess to neutral', () => {
  const dirty: GameState = { ...initialState, guess: { h: 1, s: 2, b: 3 } }
  const next = gameReducer(dirty, { type: 'startRecall' })
  expect(next.phase).toBe('recall')
  expect(next.guess).toEqual(NEUTRAL_GUESS)
})

test('setGuess applies only during recall', () => {
  const g: Hsb = { h: 10, s: 20, b: 30 }
  expect(gameReducer(initialState, { type: 'setGuess', guess: g })).toBe(
    initialState,
  )
  const recall = gameReducer(initialState, { type: 'startRecall' })
  expect(gameReducer(recall, { type: 'setGuess', guess: g }).guess).toEqual(g)
})

test('submit scores the round and moves to result', () => {
  let s = gameReducer(initialState, { type: 'startRecall' })
  s = gameReducer(s, { type: 'setGuess', guess: target }) // perfect
  s = gameReducer(s, { type: 'submit', target })
  expect(s.phase).toBe('result')
  expect(s.results).toHaveLength(1)
  expect(s.results[0]).toMatchObject({ target, guess: target, points: 10 })
})

test('next walks all 5 rounds then lands on final', () => {
  let s: GameState = initialState
  for (let r = 0; r < 5; r++) {
    expect(s).toMatchObject({ phase: 'reveal', round: r })
    s = gameReducer(s, { type: 'startRecall' })
    s = gameReducer(s, { type: 'submit', target })
    expect(s.phase).toBe('result')
    s = gameReducer(s, { type: 'next' })
  }
  expect(s.phase).toBe('final')
  expect(s.results).toHaveLength(5)
})

test('out-of-phase actions are ignored', () => {
  expect(gameReducer(initialState, { type: 'submit', target })).toBe(
    initialState,
  )
  expect(gameReducer(initialState, { type: 'next' })).toBe(initialState)
})
