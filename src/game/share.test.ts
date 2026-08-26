import {
  challengeMessage,
  challengeUrl,
  parseChallenge,
  shareChallenge,
} from './share.ts'
import { seedToCode } from './rng.ts'

describe('challengeUrl', () => {
  test('seed in the path, difficulty + score in the query', () => {
    expect(
      challengeUrl(123456, 'hard', 38.5, undefined, 'https://tinty.fun'),
    ).toBe(`https://tinty.fun/c/${seedToCode(123456)}?d=hard&s=38.5`)
  })

  test('a 5-round breakdown rides along in `b`', () => {
    expect(
      challengeUrl(
        1,
        'easy',
        30,
        [8, 6.5, 9, 3.2, 3.3],
        'https://tinty.fun',
      ),
    ).toBe(
      `https://tinty.fun/c/${seedToCode(1)}?d=easy&s=30&b=8_6.5_9_3.2_3.3`,
    )
  })
})

describe('parseChallenge', () => {
  const parse = (code: string | undefined, qs = '') =>
    parseChallenge(code, new URLSearchParams(qs))

  test('round-trips a built link with breakdown', () => {
    const built = new URL(
      challengeUrl(999, 'easy', 41, [10, 9, 8, 7, 7], 'https://tinty.fun'),
    )
    expect(
      parse(built.pathname.split('/').pop(), built.search.slice(1)),
    ).toEqual({
      seed: 999,
      code: seedToCode(999),
      difficulty: 'easy',
      challengerScore: 41,
      challengerBreakdown: [10, 9, 8, 7, 7],
    })
  })

  test('rejects a bad or missing code', () => {
    expect(parse(undefined)).toBeNull()
    expect(parse('')).toBeNull()
    expect(parse('nope')).toBeNull()
    expect(parse('TOOLONG')).toBeNull()
  })

  test('defaults difficulty, tolerates no score or breakdown', () => {
    expect(parse(seedToCode(7))).toMatchObject({
      seed: 7,
      difficulty: 'easy',
      challengerScore: null,
      challengerBreakdown: null,
    })
  })

  test('drops a garbage score / breakdown, keeps valid ones', () => {
    expect(parse(seedToCode(7), 's=999')?.challengerScore).toBeNull()
    expect(parse(seedToCode(7), 's=abc')?.challengerScore).toBeNull()
    expect(parse(seedToCode(7), 's=41.25')?.challengerScore).toBe(41.25)
    expect(parse(seedToCode(7), 'b=1_2_3')?.challengerBreakdown).toBeNull()
    expect(parse(seedToCode(7), 'b=1_2_3_4_99')?.challengerBreakdown).toBeNull()
    expect(parse(seedToCode(7), 'b=1_2_3_4_5')?.challengerBreakdown).toEqual([
      1, 2, 3, 4, 5,
    ])
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
