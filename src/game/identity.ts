/**
 * Persistent, login-free identity for the leaderboards.
 *
 *  - a random **device id**, generated once and kept in localStorage. It's the
 *    only thing that ties a score to "you", and it never leaves the device
 *    except as an opaque key on a leaderboard row.
 *  - a **display name**, chosen the first time you post a personal best. The
 *    server de-duplicates it across devices (see `claim_player_name` in
 *    supabase/migrations/0003) so two different people can't share one name.
 *  - a small **avatar** (coloured circle + initials) whose colour is hashed
 *    from the device id, so it's stable and needs nothing stored.
 *
 * This is separate from `player.ts` — that 3-letter tag is an ephemeral label
 * inside a live room, not an identity.
 */

const DEVICE_KEY = 'tinty.device'
const NAME_KEY = 'tinty.name'

export const NAME_MAX_LENGTH = 40

function randomDeviceId(): string {
  try {
    const bytes = new Uint8Array(10)
    crypto.getRandomValues(bytes)
    return (
      'd_' +
      Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    )
  } catch {
    return 'd_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
  }
}

/** The persistent device id — generated + stored on first call. */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing && /^d_[a-z0-9]+$/i.test(existing)) return existing
    const id = randomDeviceId()
    localStorage.setItem(DEVICE_KEY, id)
    return id
  } catch {
    // private mode / storage disabled — a per-session id is the best we can do
    return randomDeviceId()
  }
}

/** Trim, collapse inner whitespace, cap length. Keeps letters, spaces, most
 *  punctuation — "no character limit" per the spec, just a sane storage cap. */
export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LENGTH)
}

export function getDisplayName(): string {
  try {
    return sanitizeName(localStorage.getItem(NAME_KEY) ?? '')
  } catch {
    return ''
  }
}

export function setDisplayName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, sanitizeName(name))
  } catch {
    // ignore — the name just won't persist
  }
}

export function hasDisplayName(): boolean {
  return getDisplayName().length > 0
}

// --- avatar --------------------------------------------------------------

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** First letters of the first two words, else the first two characters. */
export function initialsFor(name: string): string {
  const clean = sanitizeName(name)
  if (!clean) return '?'
  const words = clean.split(' ').filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

export interface AvatarStyle {
  bg: string
  fg: string
  initials: string
}

/** Deterministic colour + initials for a device. Colour keys off the device
 *  id (stable even if the name changes); initials off the name. */
export function avatarFor(deviceId: string, name: string): AvatarStyle {
  const hue = fnv1a(deviceId) % 360
  return {
    bg: `hsl(${hue} 58% 47%)`,
    fg: '#ffffff',
    initials: initialsFor(name),
  }
}
