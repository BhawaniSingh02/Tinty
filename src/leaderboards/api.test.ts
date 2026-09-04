import {
  fetchBoard,
  fetchMyStanding,
  submitScore,
  subscribeToBoard,
} from './api.ts'

vi.mock('../lib/supabase.ts', () => ({
  getSupabase: () => null,
  isSupabaseConfigured: false,
}))

test('reads return null when Supabase is unconfigured', async () => {
  expect(await fetchBoard('color:easy')).toBeNull()
  expect(await fetchMyStanding('color:easy', 'd_abc')).toBeNull()
})

test('submitScore returns null when Supabase is unconfigured', async () => {
  expect(
    await submitScore({
      board: 'color:easy',
      deviceId: 'd_abc',
      name: 'Bhoni',
      score: 42,
      breakdown: [10, 8, 9, 7, 8],
    }),
  ).toBeNull()
})

test('subscribeToBoard is a no-op that returns an unsubscribe fn', () => {
  const unsub = subscribeToBoard('color:easy', () => {})
  expect(typeof unsub).toBe('function')
  expect(() => unsub()).not.toThrow()
})
