import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase is optional. Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
 * the game plays fine — only the daily leaderboard and global counter go dark.
 *
 * The client library (~large) is lazy-imported the first time it's needed, so
 * it never lands in the initial bundle.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

let clientPromise: Promise<SupabaseClient> | undefined

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!url || !key) return null
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, key, { auth: { persistSession: false } }),
  )
  return clientPromise
}
