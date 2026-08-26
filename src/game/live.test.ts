import {
  dedupeById,
  electHost,
  mergeScore,
  roomChannel,
  roomSeed,
  roomStandings,
} from './live.ts'
import { seedToCode } from './rng.ts'

const player = (id: string, joinedAt: number, tag = id.toUpperCase()) => ({
  id,
  tag,
  joinedAt,
})

describe('electHost', () => {
  test('earliest joiner wins', () => {
    expect(
      electHost([player('b', 200), player('a', 100), player('c', 300)]),
    ).toBe('a')
  })

  test('tiebreak by id', () => {
    expect(electHost([player('z', 100), player('a', 100)])).toBe('a')
  })

  test('null for an empty room', () => {
    expect(electHost([])).toBeNull()
  })

  test('re-elects when the host leaves', () => {
    const all = [player('a', 100), player('b', 200), player('c', 300)]
    expect(electHost(all.slice(1))).toBe('b')
  })
})

describe('mergeScore', () => {
  test('sets a round score without mutating', () => {
    const a: Record<string, number[]> = {}
    const b = mergeScore(a, 'x', 0, 8)
    expect(b).toEqual({ x: [8] })
    expect(a).toEqual({})
    expect(mergeScore(b, 'x', 1, 5).x).toEqual([8, 5])
  })
})

describe('roomStandings', () => {
  const players = [player('a', 1, 'AAA'), player('b', 2, 'BBB')]

  test('sorted by total desc, flags done', () => {
    const board = roomStandings(players, {
      a: [10, 10, 10, 10, 10],
      b: [1, 2, 3],
    })
    expect(board.map((s) => s.id)).toEqual(['a', 'b'])
    expect(board[0]).toMatchObject({ total: 50, played: 5, done: true })
    expect(board[1]).toMatchObject({ total: 6, played: 3, done: false })
  })

  test('a player with no scores shows zero', () => {
    const board = roomStandings(players, { a: [10] })
    expect(board.find((s) => s.id === 'b')).toMatchObject({
      total: 0,
      played: 0,
      done: false,
    })
  })
})

describe('dedupeById', () => {
  test('keeps the latest entry per id', () => {
    const out = dedupeById([
      player('a', 1, 'OLD'),
      player('a', 2, 'NEW'),
      player('b', 3),
    ])
    expect(out).toHaveLength(2)
    expect(out.find((p) => p.id === 'a')?.tag).toBe('NEW')
  })
})

test('roomChannel and roomSeed derive from the code', () => {
  const code = seedToCode(12345)
  expect(roomChannel(code)).toBe(`tinty-room-${code}`)
  expect(roomSeed(code)).toBe(12345)
})
