import { getSupabase } from '../lib/supabase.ts'
import { MAX_SCORE } from './scoring.ts'

/**
 * Daily leaderboard + global play counter, backed by Supabase. Every function
 * returns a safe fallback (`null` / `[]`) when Supabase isn't configured or a
 * request fails — callers show an "offline" state rather than breaking.
 *
 * The leaderboard is anon-write by design (no accounts). It's a speed bump,
 * not fraud-proof.
 */

export interface LeaderboardEntry {
  tag: string
  score: number
  rank: number
}

export interface Standing {
  rank: number
  total: number
}

async function client() {
  const p = getSupabase()
  return p ? await p : null
}

const toNumber = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/** Add a score to today's daily board; returns the player's standing. */
export async function submitDailyScore(input: {
  ymd: string
  tag: string
  score: number
  breakdown: number[]
}): Promise<Standing | null> {
  const sb = await client()
  if (!sb) return null
  const score = Math.min(MAX_SCORE, Math.max(0, input.score))
  try {
    const { error } = await sb.from('daily_scores').insert({
      ymd: input.ymd,
      tag: input.tag.slice(0, 3),
      score,
      breakdown: input.breakdown,
    })
    if (error) return null
    return await fetchStanding(input.ymd, score)
  } catch {
    return null
  }
}

/** Where a given score sits on the day's board (1 = best). */
export async function fetchStanding(
  ymd: string,
  score: number,
): Promise<Standing | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const [better, all] = await Promise.all([
      sb
        .from('daily_scores')
        .select('*', { count: 'exact', head: true })
        .eq('ymd', ymd)
        .gt('score', score),
      sb
        .from('daily_scores')
        .select('*', { count: 'exact', head: true })
        .eq('ymd', ymd),
    ])
    if (better.error || all.error) return null
    return { rank: (better.count ?? 0) + 1, total: all.count ?? 0 }
  } catch {
    return null
  }
}

/** Top scores for a day, best first. */
export async function fetchDailyLeaderboard(
  ymd: string,
  limit = 10,
): Promise<LeaderboardEntry[] | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from('daily_scores')
      .select('tag, score')
      .eq('ymd', ymd)
      .order('score', { ascending: false })
      .limit(limit)
    if (error || !data) return null
    return data.map((row, i) => ({
      tag: String((row as { tag: unknown }).tag ?? '???'),
      score: toNumber((row as { score: unknown }).score) ?? 0,
      rank: i + 1,
    }))
  } catch {
    return null
  }
}

/** Total games played across the whole site, ever. */
export async function fetchGlobalPlays(): Promise<number | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from('counters')
      .select('value')
      .eq('name', 'total_games')
      .single()
    if (error) return null
    return toNumber((data as { value: unknown } | null)?.value)
  } catch {
    return null
  }
}

/** Increment the global counter and return this game's number. Fire-and-forget. */
export async function bumpGlobalPlays(): Promise<number | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb.rpc('bump_plays')
    return error ? null : toNumber(data)
  } catch {
    return null
  }
}
