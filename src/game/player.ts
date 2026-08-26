/** The 3-letter tag shown on leaderboards. No login — just remembered locally. */

const KEY = 'tinty.tag'

/** Uppercase, letters/digits only, max 3. */
export function sanitizeTag(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
}

export function getPlayerTag(): string {
  try {
    return sanitizeTag(localStorage.getItem(KEY) ?? '')
  } catch {
    return ''
  }
}

export function setPlayerTag(tag: string): void {
  try {
    localStorage.setItem(KEY, sanitizeTag(tag))
  } catch {
    // ignore
  }
}
