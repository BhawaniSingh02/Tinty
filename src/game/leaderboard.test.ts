import { bumpGlobalPlays, fetchGlobalPlays } from './leaderboard.ts'

vi.mock('../lib/supabase.ts', () => ({
  getSupabase: () => null,
  isSupabaseConfigured: false,
}))

test('the global-counter calls return a safe fallback when Supabase is off', async () => {
  expect(await fetchGlobalPlays()).toBeNull()
  expect(await bumpGlobalPlays()).toBeNull()
})
