import {
  avatarFor,
  getDeviceId,
  getDisplayName,
  initialsFor,
  sanitizeName,
  setDisplayName,
} from './identity.ts'

beforeEach(() => localStorage.clear())

test('device id is generated once and then stable', () => {
  const a = getDeviceId()
  expect(a).toMatch(/^d_[0-9a-f]+$/i)
  expect(getDeviceId()).toBe(a)
})

test('sanitizeName trims, collapses whitespace, caps length', () => {
  expect(sanitizeName('  Bhawani   Singh  ')).toBe('Bhawani Singh')
  expect(sanitizeName('x'.repeat(80))).toHaveLength(40)
  expect(sanitizeName('')).toBe('')
})

test('display name round-trips through localStorage', () => {
  expect(getDisplayName()).toBe('')
  setDisplayName('  Bhoni ')
  expect(getDisplayName()).toBe('Bhoni')
})

test('initials: two words → first letters, one word → first two chars', () => {
  expect(initialsFor('Bhawani Singh')).toBe('BS')
  expect(initialsFor('bhoni')).toBe('BH')
  expect(initialsFor('')).toBe('?')
})

test('avatarFor is deterministic for a device and independent of the name colour', () => {
  const a = avatarFor('d_abc123', 'Bhoni')
  const b = avatarFor('d_abc123', 'Someone Else')
  expect(a.bg).toBe(b.bg) // colour keyed off device id only
  expect(a.initials).toBe('BH')
  expect(b.initials).toBe('SE')
  expect(avatarFor('d_zzz', 'X').bg).not.toBe(a.bg)
})
