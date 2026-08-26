import { challengeUrl, copyToClipboard, parseChallenge } from './share.ts'
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

describe('copyToClipboard', () => {
  afterEach(() => vi.unstubAllGlobals())

  test('writes to the clipboard and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await copyToClipboard('https://tinty.fun/c/abc')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('https://tinty.fun/c/abc')
  })

  test('returns false when the clipboard is unavailable or blocked', async () => {
    vi.stubGlobal('navigator', {})
    expect(await copyToClipboard('x')).toBe(false)

    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('nope')) },
    })
    expect(await copyToClipboard('x')).toBe(false)
  })
})
