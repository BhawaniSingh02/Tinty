import { codeToSeed, seedToCode } from './rng.ts'
import { parseDifficulty, type Difficulty } from './difficulty.ts'
import { MAX_SCORE } from './scoring.ts'

/**
 * Challenge links are self-contained: the seed rides in the path, difficulty
 * and the challenger's score ride in the query. No backend — a friend who
 * opens the link plays the exact same 5 colors and sees the two scores
 * side by side.
 *
 *   tinty.fun/c/<code>?d=hard&s=41
 */

export interface ParsedChallenge {
  seed: number
  code: string
  difficulty: Difficulty
  /** The challenger's score, or null if absent / malformed. */
  challengerScore: number | null
}

const round2 = (n: number) => Math.round(n * 100) / 100

function parseScore(raw: string | null): number | null {
  if (raw === null) return null
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n < 0 || n > MAX_SCORE) return null
  return round2(n)
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
  }
}

function currentOrigin(): string {
  return globalThis.location?.origin ?? 'https://tinty.fun'
}

/** The `/c/:code` URL for a game, with the challenger's score if there is one. */
export function challengeLink(
  code: string,
  difficulty: Difficulty,
  score?: number,
  origin: string = currentOrigin(),
): string {
  const params = new URLSearchParams({ d: difficulty })
  if (score !== undefined) params.set('s', String(round2(score)))
  return `${origin}/c/${code}?${params.toString()}`
}

/** Same, keyed by seed — for a game the player just finished. */
export function challengeUrl(
  seed: number,
  difficulty: Difficulty,
  score: number,
  origin: string = currentOrigin(),
): string {
  return challengeLink(seedToCode(seed), difficulty, score, origin)
}

/** The pre-filled brag that goes with a played challenge link. */
export function challengeMessage(score: number, url: string): string {
  return `I got ${score.toFixed(2)}/50 on Tinty Color Match — closest match wins: ${url}`
}

/** The pre-filled invite for a "play with friends" link shared before playing. */
export function inviteMessage(url: string): string {
  return `Play these 5 colors with me on Tinty Color Match: ${url}`
}

export type ShareResult = 'shared' | 'copied' | 'dismissed' | 'failed'

/**
 * One tap: the native share sheet if the browser has one, otherwise copy the
 * message to the clipboard. `dismissed` means the user backed out of the sheet.
 * The URL is embedded in `message`, so nothing is passed to `share()` as a
 * separate `url` (which some targets would then append a second time).
 */
export async function shareChallenge(message: string): Promise<ShareResult> {
  const nav = globalThis.navigator as Navigator | undefined

  if (nav?.share) {
    try {
      await nav.share({ text: message })
      return 'shared'
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError') {
        return 'dismissed'
      }
      // any other failure — fall through to the clipboard
    }
  }

  if (!nav?.clipboard?.writeText) return 'failed'
  try {
    await nav.clipboard.writeText(message)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/** Plain clipboard copy — used where there's no native-share fallback wanted. */
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
