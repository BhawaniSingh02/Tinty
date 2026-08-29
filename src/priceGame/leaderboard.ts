import { getSupabase } from '../lib/supabase.ts'
import { MAX_SCORE } from './scoring.ts'

export { fetchGlobalPlays, bumpGlobalPlays } from '../game/leaderboard.ts'

/**
 * Price Check's daily leaderboard, backed by Supabase (its own table, kept
 * separate from Color Match's `daily_scores` so the two games don't mix
 * rankings). The site-wide "games played" counter is shared — see
 * game/leaderboard.ts, re-exported above.
 *
 * Every function returns a safe fallback (`null` / `[]`) when Supabase isn't
 * configured or a request fails.
 */

export interface PriceLeaderboardEntry {
  tag: string
  score: number
  rank: number
}

export interface PriceStanding {
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

/** Add a score to today's price daily board; returns the player's standing. */
export async function submitPriceDailyScore(input: {
  ymd: string
  tag: string
  score: number
  breakdown: number[]
}): Promise<PriceStanding | null> {
  const sb = await client()
  if (!sb) return null
  const score = Math.min(MAX_SCORE, Math.max(0, input.score))
  try {
    const { error } = await sb.from('price_daily_scores').insert({
      ymd: input.ymd,
      tag: input.tag.slice(0, 3),
      score,
      breakdown: input.breakdown,
    })
    if (error) return null
    return await fetchPriceStanding(input.ymd, score)
  } catch {
    return null
  }
}

/** Where a given score sits on the day's board (1 = best). */
export async function fetchPriceStanding(
  ymd: string,
  score: number,
): Promise<PriceStanding | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const [better, all] = await Promise.all([
      sb
        .from('price_daily_scores')
        .select('*', { count: 'exact', head: true })
        .eq('ymd', ymd)
        .gt('score', score),
      sb
        .from('price_daily_scores')
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
export async function fetchPriceDailyLeaderboard(
  ymd: string,
  limit = 10,
): Promise<PriceLeaderboardEntry[] | null> {
  const sb = await client()
  if (!sb) return null
  try {
    const { data, error } = await sb
      .from('price_daily_scores')
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
