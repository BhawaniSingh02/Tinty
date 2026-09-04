import { getSupabase } from '../lib/supabase.ts'

/**
 * The site-wide "games played, ever" counter, backed by Supabase. Returns a
 * safe fallback (`null`) when Supabase isn't configured or a request fails.
 *
 * Per-game leaderboards live in `src/leaderboards/` — this file is only the
 * global counter now.
 */

async function client() {
  const p = getSupabase()
  return p ? await p : null
}

const toNumber = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
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
