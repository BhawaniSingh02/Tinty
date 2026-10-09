import { codeToSeed } from './rng.ts'
import { ROUNDS } from './scoring.ts'

/**
 * Live head-to-head. The room is entirely ephemeral — no database. Players
 * join a Supabase Realtime channel named after the challenge code; Presence
 * gives the player list, Broadcast carries game events. The 5 colors come from
 * the code's seed (same as an async challenge), so game content needs no sync.
 *
 * Rounds are self-paced after a shared "start" — everyone begins round 1 at the
 * same moment, then plays at their own speed while scores tick in live. Robust
 * to a player disconnecting mid-game.
 */

export const ROOM_PREFIX = 'tinty-room-'

/** `namespace` keeps other games' rooms (e.g. "puzzle-") off this channel. */
export const roomChannel = (code: string, namespace = '') =>
  ROOM_PREFIX + namespace + code.toLowerCase()

export const roomSeed = (code: string): number => codeToSeed(code) ?? 0

export interface LivePlayer {
  id: string
  tag: string
  joinedAt: number
}

export type LiveMessage =
  | { t: 'start'; seed: number }
  | { t: 'rematch'; seed: number }
  | { t: 'submit'; id: string; n: number; score: number }
  | ({ t: 'progress'; id: string } & LiveProgress)

/** Mid-game progress for games with no rounds (Picture Puzzle tiles). */
export interface LiveProgress {
  correct: number
  total: number
  moves: number
  seconds: number
  done: boolean
}

/** Deterministic host: earliest joiner, tiebreak by id. Survives the host leaving. */
export function electHost(players: LivePlayer[]): string | null {
  if (players.length === 0) return null
  return [...players].sort(
    (a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id),
  )[0].id
}

/** Latest presence entry wins if an id shows up twice mid-sync. */
export function dedupeById(players: LivePlayer[]): LivePlayer[] {
  const byId = new Map<string, LivePlayer>()
  for (const p of players) byId.set(p.id, p)
  return [...byId.values()]
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function mergeScore(
  scores: Record<string, number[]>,
  id: string,
  n: number,
  score: number,
): Record<string, number[]> {
  const next = scores[id] ? [...scores[id]] : []
  next[n] = score
  return { ...scores, [id]: next }
}

export interface RoomStanding {
  id: string
  tag: string
  total: number
  played: number
  done: boolean
}

export function roomStandings(
  players: LivePlayer[],
  scores: Record<string, number[]>,
  rounds = ROUNDS,
): RoomStanding[] {
  return players
    .map((p) => {
      const s = (scores[p.id] ?? []).filter((n) => typeof n === 'number')
      return {
        id: p.id,
        tag: p.tag || '???',
        total: round2(s.reduce((a, b) => a + b, 0)),
        played: s.length,
        done: s.length >= rounds,
      }
    })
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))
}
