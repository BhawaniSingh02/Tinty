import { getSupabase } from '../lib/supabase.ts'
import { MAX_SCORE } from '../game/scoring.ts'

/**
 * Leaderboard reads/writes, backed by Supabase (tables + RPCs from
 * supabase/migrations/0003). Every function returns a safe fallback — `null`
 * for reads, a no-op unsubscribe for the subscription — when Supabase isn't
 * configured or a request fails, so the UI just shows an "offline" state.
 *
 * `board` here is the full DB board string (see leaderboards/config.ts →
 * `dbBoard`), e.g. "color:easy" or "color:daily:2026-09-04".
 */

export interface BoardEntry {
  deviceId: string
  name: string
  score: number
  rank: number
}

export interface MyStanding {
  rank: number
  total: number
  score: number
  name: string
}

async function client() {
  const p = getSupabase()
  return p ? await p : null
}

const toNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

const clampScore = (n: number) => Math.min(MAX_SCORE, Math.max(0, n))

interface JoinedRow {
  device_id: unknown
  score: unknown
  players: { name: unknown } | { name: unknown }[] | null
}

const rowName = (players: JoinedRow['players']): string => {
  const p = Array.isArray(players) ? players[0] : players
  return p && typeof p.name === 'string' ? p.name : '???'
}

/** Top scores for a board, best first (ties: earlier submission wins). */
export async function fetchBoard(
  board: string,
  limit = 50,
): Promise<BoardEntry[] | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from('leaderboard_scores')
      .select('device_id, score, players!inner(name)')
      .eq('board', board)
      .order('score', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limit)
    if (error || !data) return null
    return (data as JoinedRow[]).map((row, i) => ({
      deviceId: String(row.device_id ?? ''),
      name: rowName(row.players),
      score: toNumber(row.score),
      rank: i + 1,
    }))
  } catch {
    return null
  }
}

/** Where this device stands on a board — `null` if it has no row there. */
export async function fetchMyStanding(
  board: string,
  deviceId: string,
): Promise<MyStanding | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const mine = await sb
      .from('leaderboard_scores')
      .select('score, players!inner(name)')
      .eq('board', board)
      .eq('device_id', deviceId)
      .maybeSingle()
    if (mine.error || !mine.data) return null
    const score = toNumber((mine.data as JoinedRow).score)
    const [better, all] = await Promise.all([
      sb
        .from('leaderboard_scores')
        .select('*', { count: 'exact', head: true })
        .eq('board', board)
        .gt('score', score),
      sb
        .from('leaderboard_scores')
        .select('*', { count: 'exact', head: true })
        .eq('board', board),
    ])
    if (better.error || all.error) return null
    return {
      rank: (better.count ?? 0) + 1,
      total: all.count ?? 0,
      score,
      name: rowName((mine.data as JoinedRow).players),
    }
  } catch {
    return null
  }
}

/** Claim/confirm the name and post the score (server keeps it only if it's a
 *  new personal best for the device on that board). Returns the standing. */
export async function submitScore(input: {
  board: string
  deviceId: string
  name: string
  score: number
  breakdown: number[]
}): Promise<MyStanding | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb.rpc('submit_leaderboard_score', {
      p_board: input.board,
      p_device_id: input.deviceId,
      p_name: input.name,
      p_score: clampScore(input.score),
      p_breakdown: input.breakdown,
    })
    if (error || !data) return null
    const d = data as Record<string, unknown>
    return {
      rank: toNumber(d.rank),
      total: toNumber(d.total),
      score: toNumber(d.score),
      name: typeof d.name === 'string' ? d.name : input.name,
    }
  } catch {
    return null
  }
}

/**
 * Call `onChange` whenever any row on this board is inserted/updated/deleted.
 * Returns an unsubscribe fn. No-op (returns a no-op) when Supabase is off.
 */
export function subscribeToBoard(board: string, onChange: () => void): () => void {
  const p = getSupabase()
  if (!p) return () => {}
  let cleanup: (() => void) | null = null
  let cancelled = false

  void p.then((sb) => {
    if (cancelled) return
    const channel = sb
      .channel(`lb:${board}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_scores',
          filter: `board=eq.${board}`,
        },
        () => onChange(),
      )
      .subscribe()
    cleanup = () => {
      void sb.removeChannel(channel)
    }
  })

  return () => {
    cancelled = true
    cleanup?.()
  }
}
