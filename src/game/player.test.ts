import { getPlayerTag, sanitizeTag, setPlayerTag } from './player.ts'

beforeEach(() => {
  localStorage.clear()
})

test('sanitizeTag uppercases, strips non-alphanumerics, caps at 3', () => {
  expect(sanitizeTag('a-b!c d')).toBe('ABC')
  expect(sanitizeTag('toolong')).toBe('TOO')
  expect(sanitizeTag('  ')).toBe('')
  expect(sanitizeTag('x9')).toBe('X9')
})

test('round-trips through localStorage', () => {
  expect(getPlayerTag()).toBe('')
  setPlayerTag('xy9')
  expect(getPlayerTag()).toBe('XY9')
})
