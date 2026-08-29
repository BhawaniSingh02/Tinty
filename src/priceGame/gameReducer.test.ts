import {
  priceGameReducer,
  initialPriceState,
  type PriceGameState,
} from './gameReducer.ts'
import type { PriceItem } from './types.ts'

const item: PriceItem = {
  category: 'watches',
  brand: 'TestBrand',
  name: 'Test Watch',
  image_url: 'https://example.com/x.jpg',
  image_license: 'CC0',
  price: 100,
  currency: 'USD',
  tier: 'mid',
  price_source: 'test',
}

test('starts in question on round 0 with no results', () => {
  expect(initialPriceState).toMatchObject({
    phase: 'question',
    round: 0,
    results: [],
  })
})

test('setGuess applies only during question', () => {
  const next = priceGameReducer(initialPriceState, {
    type: 'setGuess',
    guess: 50,
  })
  expect(next.guess).toBe(50)

  const result: PriceGameState = { ...initialPriceState, phase: 'result' }
  expect(
    priceGameReducer(result, { type: 'setGuess', guess: 99 }),
  ).toBe(result)
})

test('submit scores the round and moves to result', () => {
  let s = priceGameReducer(initialPriceState, { type: 'setGuess', guess: 100 })
  s = priceGameReducer(s, { type: 'submit', item })
  expect(s.phase).toBe('result')
  expect(s.results).toHaveLength(1)
  expect(s.results[0]).toMatchObject({ item, guess: 100, points: 10 })
})

test('submit is ignored without a guess', () => {
  expect(
    priceGameReducer(initialPriceState, { type: 'submit', item }),
  ).toBe(initialPriceState)
})

test('next walks all 5 rounds then lands on final', () => {
  let s: PriceGameState = initialPriceState
  for (let r = 0; r < 5; r++) {
    expect(s).toMatchObject({ phase: 'question', round: r })
    s = priceGameReducer(s, { type: 'setGuess', guess: 100 })
    s = priceGameReducer(s, { type: 'submit', item })
    expect(s.phase).toBe('result')
    s = priceGameReducer(s, { type: 'next' })
  }
  expect(s.phase).toBe('final')
  expect(s.results).toHaveLength(5)
})

test('out-of-phase actions are ignored', () => {
  expect(priceGameReducer(initialPriceState, { type: 'next' })).toBe(
    initialPriceState,
  )
})
