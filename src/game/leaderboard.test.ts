import {
  bumpGlobalPlays,
  fetchDailyLeaderboard,
  fetchGlobalPlays,
  fetchStanding,
  submitDailyScore,
} from './leaderboard.ts'

vi.mock('../lib/supabase.ts', () => ({
  getSupabase: () => null,
  isSupabaseConfigured: false,
}))

test('every call returns a safe fallback when Supabase is unconfigured', async () => {
  expect(
    await submitDailyScore({
      ymd: '2026-08-26',
      tag: 'ABC',
      score: 40,
      breakdown: [10, 10, 10, 5, 5],
    }),
  ).toBeNull()
  expect(await fetchStanding('2026-08-26', 40)).toBeNull()
  expect(await fetchDailyLeaderboard('2026-08-26')).toBeNull()
  expect(await fetchGlobalPlays()).toBeNull()
  expect(await bumpGlobalPlays()).toBeNull()
})
