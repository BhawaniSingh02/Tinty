import { codeToSeed, seedToCode } from '../game/rng.ts'
import { MAX_POINTS_PER_ROUND, MAX_SCORE, ROUNDS } from './scoring.ts'

export { copyToClipboard } from '../game/share.ts'

/**
 * Price Check challenge links are self-contained: the seed rides in the path,
 * the challenger's score rides in the query. No backend — a friend who opens
 * the link plays the exact same 5 items and sees the two scores side by side.
 *
 *   tinty.fun/price/c/<code>?s=41&b=10_8_5_2_10
 */

export interface ParsedPriceChallenge {
  seed: number
  code: string
  challengerScore: number | null
  challengerBreakdown: number[] | null
}

function parseScore(raw: string | null): number | null {
  if (raw === null) return null
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n >= 0 && n <= MAX_SCORE ? n : null
}

function parseBreakdown(raw: string | null): number[] | null {
  if (raw === null) return null
  const parts = raw.split('_').map(Number.parseFloat)
  if (
    parts.length !== ROUNDS ||
    parts.some((n) => !Number.isFinite(n) || n < 0 || n > MAX_POINTS_PER_ROUND)
  ) {
    return null
  }
  return parts
}

/** Parse `/price/c/:code` + its query, or null if the code is unusable. */
export function parsePriceChallenge(
  code: string | undefined,
  params: URLSearchParams,
): ParsedPriceChallenge | null {
  if (!code) return null
  const seed = codeToSeed(code)
  if (seed === null) return null
  return {
    seed,
    code,
    challengerScore: parseScore(params.get('s')),
    challengerBreakdown: parseBreakdown(params.get('b')),
  }
}

function currentOrigin(): string {
  return globalThis.location?.origin ?? 'https://tinty.fun'
}

/** The `/price/c/:code` URL for a game, with the challenger's result if there is one. */
export function priceChallengeLink(
  code: string,
  score?: number,
  breakdown?: readonly number[],
  origin: string = currentOrigin(),
): string {
  const params = new URLSearchParams()
  if (score !== undefined) params.set('s', String(score))
  if (breakdown && breakdown.length === ROUNDS) {
    params.set('b', breakdown.join('_'))
  }
  const qs = params.toString()
  return `${origin}/price/c/${code}${qs ? `?${qs}` : ''}`
}

/** Same, keyed by seed — for a game the player just finished. */
export function priceChallengeUrl(
  seed: number,
  score: number,
  breakdown?: readonly number[],
  origin: string = currentOrigin(),
): string {
  return priceChallengeLink(seedToCode(seed), score, breakdown, origin)
}

/** The `/price/live/:code` URL for a real-time room. */
export function priceLiveLink(code: string, origin: string = currentOrigin()): string {
  return `${origin}/price/live/${code}`
}
