import {
  parsePuzzleChallenge,
  puzzleChallengeLink,
  puzzleChallengeUrl,
  puzzleLiveLink,
  puzzleShareText,
} from './share.ts'
import { seedToCode } from '../game/rng.ts'

const O = 'https://tinty.fun'

test('challenge link round-trips seed, size and result', () => {
  const url = puzzleChallengeUrl(123456, 'hard', { score: 7.456, seconds: 83.7, moves: 19 }, O)
  expect(url).toBe(`${O}/puzzle/c/${seedToCode(123456)}?d=hard&s=7.46&t=84&m=19`)
  const u = new URL(url)
  const parsed = parsePuzzleChallenge(u.pathname.split('/').pop(), u.searchParams)
  expect(parsed).toEqual({
    seed: 123456,
    code: seedToCode(123456),
    difficulty: 'hard',
    challenger: { score: 7.46, seconds: 84, moves: 19 },
  })
})

test('an unplayed link has no challenger and defaults to easy', () => {
  expect(puzzleChallengeLink('abc123', 'medium', undefined, O)).toBe(`${O}/puzzle/c/abc123?d=medium`)
  const p = parsePuzzleChallenge('abc123', new URLSearchParams(''))
  expect(p?.challenger).toBeNull()
  expect(p?.difficulty).toBe('easy')
})

test('bad codes and junk scores are rejected', () => {
  expect(parsePuzzleChallenge(undefined, new URLSearchParams())).toBeNull()
  expect(parsePuzzleChallenge('nope', new URLSearchParams())).toBeNull()
  expect(parsePuzzleChallenge('abc123', new URLSearchParams('s=11'))?.challenger).toBeNull()
  expect(parsePuzzleChallenge('abc123', new URLSearchParams('s=x'))?.challenger).toBeNull()
  // a valid score with junk stats keeps the score, drops the stats
  expect(parsePuzzleChallenge('abc123', new URLSearchParams('s=5&t=-1&m=abc'))?.challenger).toEqual({
    score: 5,
    seconds: null,
    moves: null,
  })
})

test('live link + share text', () => {
  expect(puzzleLiveLink('abc123', 'hard', O)).toBe(`${O}/puzzle/live/abc123?d=hard`)
  expect(puzzleShareText({ score: 8.4, seconds: 72, moves: 18, size: 4 }, O)).toBe(
    '🧩 Tinty Picture Puzzle — 8.40/10 on a 4×4 in 1:12, 18 moves. https://tinty.fun/puzzle',
  )
})
