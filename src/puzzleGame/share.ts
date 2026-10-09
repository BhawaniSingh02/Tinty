import { codeToSeed, seedToCode } from '../game/rng.ts'
import { parsePuzzleDifficulty, type PuzzleDifficulty } from './difficulty.ts'
import { MAX_SCORE } from './scoring.ts'

export { copyToClipboard } from '../game/share.ts'

/**
 * Picture Puzzle challenge links are self-contained: the seed rides in the
 * path, grid size and the challenger's result ride in the query. No backend —
 * a friend who opens the link solves the exact same image + shuffle and sees
 * both results side by side.
 *
 *   tinty.fun/puzzle/c/<code>?d=medium&s=7.42&t=83&m=19
 */

export interface PuzzleChallengeResult {
  score: number
  seconds: number | null
  moves: number | null
}

export interface ParsedPuzzleChallenge {
  seed: number
  code: string
  difficulty: PuzzleDifficulty
  challenger: PuzzleChallengeResult | null
}

const round2 = (n: number) => Math.round(n * 100) / 100

function parseScore(raw: string | null): number | null {
  if (raw === null) return null
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n >= 0 && n <= MAX_SCORE ? round2(n) : null
}

function parseCount(raw: string | null, max: number): number | null {
  if (raw === null) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null
}

/** Parse `/puzzle/c/:code` + its query, or null if the code is unusable. */
export function parsePuzzleChallenge(
  code: string | undefined,
  params: URLSearchParams,
): ParsedPuzzleChallenge | null {
  if (!code) return null
  const seed = codeToSeed(code)
  if (seed === null) return null
  const score = parseScore(params.get('s'))
  return {
    seed,
    code,
    difficulty: parsePuzzleDifficulty(params.get('d')),
    challenger:
      score === null
        ? null
        : {
            score,
            seconds: parseCount(params.get('t'), 24 * 3600),
            moves: parseCount(params.get('m'), 10_000),
          },
  }
}

function currentOrigin(): string {
  return globalThis.location?.origin ?? 'https://tinty.fun'
}

/** The `/puzzle/c/:code` URL, with the challenger's result if there is one. */
export function puzzleChallengeLink(
  code: string,
  difficulty: PuzzleDifficulty,
  result?: { score: number; seconds: number; moves: number },
  origin: string = currentOrigin(),
): string {
  const params = new URLSearchParams({ d: difficulty })
  if (result) {
    params.set('s', String(round2(result.score)))
    params.set('t', String(Math.round(result.seconds)))
    params.set('m', String(result.moves))
  }
  return `${origin}/puzzle/c/${code}?${params.toString()}`
}

/** Same, keyed by seed — for a puzzle the player just finished. */
export function puzzleChallengeUrl(
  seed: number,
  difficulty: PuzzleDifficulty,
  result: { score: number; seconds: number; moves: number },
  origin: string = currentOrigin(),
): string {
  return puzzleChallengeLink(seedToCode(seed), difficulty, result, origin)
}

/** The `/puzzle/live/:code` URL for a real-time room. */
export function puzzleLiveLink(
  code: string,
  difficulty: PuzzleDifficulty,
  origin: string = currentOrigin(),
): string {
  return `${origin}/puzzle/live/${code}?d=${difficulty}`
}

/** The plain-text brag for the results screen's "Share" button. */
export function puzzleShareText(
  r: { score: number; seconds: number; moves: number; size: number },
  origin: string = currentOrigin(),
): string {
  const m = Math.floor(r.seconds / 60)
  const s = String(Math.floor(r.seconds % 60)).padStart(2, '0')
  return `🧩 Tinty Picture Puzzle — ${r.score.toFixed(2)}/10 on a ${r.size}×${r.size} in ${m}:${s}, ${r.moves} moves. ${origin}/puzzle`
}
