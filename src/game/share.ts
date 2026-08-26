import { codeToSeed, seedToCode } from './rng.ts'
import { parseDifficulty, type Difficulty } from './difficulty.ts'
import { MAX_POINTS_PER_ROUND, MAX_SCORE, ROUNDS } from './scoring.ts'

/**
 * Challenge links are self-contained: the seed rides in the path, difficulty
 * and the challenger's score ride in the query. No backend — a friend who
 * opens the link plays the exact same 5 colors and sees the two scores
 * side by side.
 *
 *   tinty.fun/c/<code>?d=hard&s=41&b=8.2_6.1_9_3.4_7
 */

export interface ParsedChallenge {
  seed: number
  code: string
  difficulty: Difficulty
  /** The challenger's total, or null if absent / malformed. */
  challengerScore: number | null
  /** The challenger's 5 round scores, or null. */
  challengerBreakdown: number[] | null
}

const round2 = (n: number) => Math.round(n * 100) / 100

function parseScore(raw: string | null): number | null {
  if (raw === null) return null
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n < 0 || n > MAX_SCORE) return null
  return round2(n)
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
  return parts.map(round2)
}

/** Parse `/c/:code` + its query, or null if the code is unusable. */
export function parseChallenge(
  code: string | undefined,
  params: URLSearchParams,
): ParsedChallenge | null {
  if (!code) return null
  const seed = codeToSeed(code)
  if (seed === null) return null
  return {
    seed,
    code,
    difficulty: parseDifficulty(params.get('d')),
    challengerScore: parseScore(params.get('s')),
    challengerBreakdown: parseBreakdown(params.get('b')),
  }
}

function currentOrigin(): string {
  return globalThis.location?.origin ?? 'https://tinty.fun'
}

/** The `/c/:code` URL for a game, with the challenger's result if there is one. */
export function challengeLink(
  code: string,
  difficulty: Difficulty,
  score?: number,
  breakdown?: readonly number[],
  origin: string = currentOrigin(),
): string {
  const params = new URLSearchParams({ d: difficulty })
  if (score !== undefined) params.set('s', String(round2(score)))
  if (breakdown && breakdown.length === ROUNDS) {
    params.set('b', breakdown.map((n) => String(round2(n))).join('_'))
  }
  return `${origin}/c/${code}?${params.toString()}`
}

/** Same, keyed by seed — for a game the player just finished. */
export function challengeUrl(
  seed: number,
  difficulty: Difficulty,
  score: number,
  breakdown?: readonly number[],
  origin: string = currentOrigin(),
): string {
  return challengeLink(seedToCode(seed), difficulty, score, breakdown, origin)
}

/** The `/live/:code` URL for a real-time room. */
export function liveLink(
  code: string,
  difficulty: Difficulty,
  origin: string = currentOrigin(),
): string {
  return `${origin}/live/${code}?d=${difficulty}`
}

/** Copy text to the clipboard. Returns false when it's unavailable / blocked
 *  (the caller shows the URL for manual selection instead). No native share
 *  sheet — people copy the link and send it themselves. */
export async function copyToClipboard(text: string): Promise<boolean> {
  const clip = globalThis.navigator?.clipboard
  if (!clip?.writeText) return false
  try {
    await clip.writeText(text)
    return true
  } catch {
    return false
  }
}
