import {
  challengeMessage,
  challengeUrl,
  parseChallenge,
  shareChallenge,
} from './share.ts'
import { seedToCode } from './rng.ts'

describe('challengeUrl', () => {
  test('seed in the path, difficulty and score in the query', () => {
    expect(challengeUrl(123456, 'hard', 38.5, 'https://tinty.fun')).toBe(
      `https://tinty.fun/c/${seedToCode(123456)}?d=hard&s=38.5`,
    )
  })
})

describe('parseChallenge', () => {
  const parse = (code: string | undefined, qs = '') =>
    parseChallenge(code, new URLSearchParams(qs))

  test('round-trips a built link', () => {
    const built = new URL(challengeUrl(999, 'easy', 41, 'https://tinty.fun'))
    expect(
      parse(built.pathname.split('/').pop(), built.search.slice(1)),
    ).toEqual({
      seed: 999,
      code: seedToCode(999),
      difficulty: 'easy',
      challengerScore: 41,
    })
  })

  test('rejects a bad or missing code', () => {
    expect(parse(undefined)).toBeNull()
    expect(parse('')).toBeNull()
    expect(parse('nope')).toBeNull()
    expect(parse('TOOLONG')).toBeNull()
  })

  test('defaults difficulty and tolerates no score', () => {
    expect(parse(seedToCode(7))).toMatchObject({
      seed: 7,
      difficulty: 'easy',
      challengerScore: null,
    })
  })

  test('drops a garbage or out-of-range score, keeps a valid one', () => {
    expect(parse(seedToCode(7), 's=999')?.challengerScore).toBeNull()
    expect(parse(seedToCode(7), 's=abc')?.challengerScore).toBeNull()
    expect(parse(seedToCode(7), 's=-1')?.challengerScore).toBeNull()
    expect(parse(seedToCode(7), 's=41.25')?.challengerScore).toBe(41.25)
  })
})

describe('challengeMessage', () => {
  test('pre-fills the brag with the link', () => {
    expect(challengeMessage(41, 'https://tinty.fun/c/abc123')).toBe(
      'I got 41.00/50 on Tinty Color Match — closest match wins: https://tinty.fun/c/abc123',
    )
  })
})

describe('shareChallenge', () => {
  afterEach(() => vi.unstubAllGlobals())

  test('uses the native share sheet when present', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    expect(await shareChallenge('msg')).toBe('shared')
    expect(share).toHaveBeenCalledWith({ text: 'msg' })
  })

  test('falls back to the clipboard with no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await shareChallenge('msg')).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('msg')
  })

  test('reports dismissal when the user cancels the sheet', async () => {
    const err = Object.assign(new Error('x'), { name: 'AbortError' })
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(err),
      clipboard: { writeText: vi.fn() },
    })
    expect(await shareChallenge('msg')).toBe('dismissed')
  })

  test('falls back to the clipboard when the sheet errors', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new Error('boom')),
      clipboard: { writeText },
    })
    expect(await shareChallenge('msg')).toBe('copied')
  })

  test('fails cleanly when nothing is available', async () => {
    vi.stubGlobal('navigator', {})
    expect(await shareChallenge('msg')).toBe('failed')
  })
})
