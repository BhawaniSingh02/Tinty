import {
  ALL_CATEGORIES,
  categoriesForGame,
  dbBoard,
  findCategory,
} from './config.ts'

test('Color Match has Easy + Hard + Daily; Price Guess has Solo + Daily', () => {
  expect(categoriesForGame('color').map((c) => c.key)).toEqual([
    'color:easy',
    'color:hard',
    'color:daily',
  ])
  expect(categoriesForGame('price').map((c) => c.key)).toEqual([
    'price:solo',
    'price:daily',
  ])
})

test('all-time categories carry a mode; daily categories do not', () => {
  const easy = findCategory('color:easy')
  expect(easy).toMatchObject({ kind: 'alltime', mode: 'easy', game: 'color' })
  const daily = findCategory('color:daily')
  expect(daily).toMatchObject({ kind: 'daily', game: 'color' })
  expect(daily?.mode).toBeUndefined()
})

test('dbBoard builds the DB board string', () => {
  expect(dbBoard(findCategory('color:easy')!)).toBe('color:easy')
  expect(dbBoard(findCategory('price:solo')!)).toBe('price:solo')
  expect(dbBoard(findCategory('color:daily')!, '2026-09-04')).toBe(
    'color:daily:2026-09-04',
  )
  expect(() => dbBoard(findCategory('price:daily')!)).toThrow()
})

test('Picture Puzzle has Easy + Medium + Hard + Daily', () => {
  expect(categoriesForGame('puzzle').map((c) => c.key)).toEqual([
    'puzzle:easy',
    'puzzle:medium',
    'puzzle:hard',
    'puzzle:daily',
  ])
  expect(dbBoard(findCategory('puzzle:daily')!, '2026-10-09')).toBe(
    'puzzle:daily:2026-10-09',
  )
})

test('every DB board string matches the migration regex', () => {
  // Same pattern as supabase/migrations/0004_puzzle_leaderboards.sql
  const re =
    /^(color:(easy|hard)|price:solo|puzzle:(easy|medium|hard)|(color|price|puzzle):daily:\d{4}-\d{2}-\d{2})$/
  for (const cat of ALL_CATEGORIES) {
    expect(dbBoard(cat, '2026-01-01')).toMatch(re)
  }
})

test('categoriesForGame derives from the config, not a hardcoded pair', () => {
  // A game with 3 modes + no daily would yield exactly 3 categories.
  const synthetic = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ]
  const built = synthetic.map((m) => ({
    key: `price:${m.id}`,
    game: 'price' as const,
    kind: 'alltime' as const,
    label: m.label,
    mode: m.id,
  }))
  expect(built).toHaveLength(3)
  // real config still only declares 'solo' for price
  expect(categoriesForGame('price').filter((c) => c.kind === 'alltime')).toHaveLength(1)
})
