/**
 * "Add to home screen" prompt logic — deliberately NOT shown on load.
 *
 * The custom install UI (see components/layout/InstallPrompt.tsx) only appears
 * after the player finishes a full game. This module owns:
 *   - capturing Chrome's `beforeinstallprompt` early and stashing it, so we can
 *     fire the real prompt later, on our terms;
 *   - the "how many full games has this person finished" counter;
 *   - the don't-nag rules (session dismissal + a 7-day / +N-games cooldown).
 *
 * Everything is guarded — private mode, quota, corrupted JSON all fall back to
 * "behave as a first-time visitor", never throw.
 */

// The event Chrome fires when the PWA is installable. Not in lib.dom yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const GAMES_KEY = 'tinty.install.games.v1'
const DISMISS_KEY = 'tinty.install.dismissed.v1'
const SESSION_KEY = 'tinty.install.hidden'

/** Re-show after a dismissal only once BOTH have passed. */
const COOLDOWN_DAYS = 7
const COOLDOWN_GAMES = 3

let deferredPrompt: BeforeInstallPromptEvent | null = null
let captured = false

/** Fired when a player reaches a full game's final-score screen. */
export const GAME_COMPLETE_EVENT = 'tinty:game-complete'

export function notifyGameComplete(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(GAME_COMPLETE_EVENT))
  }
}

/** Call once, as early as possible (main.tsx). Safe to call more than once. */
export function initInstallCapture(): void {
  if (captured || typeof window === 'undefined') return
  captured = true

  window.addEventListener('beforeinstallprompt', (e) => {
    // Stop Chrome's mini-infobar — we drive the prompt ourselves, post-game.
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    writeJson(DISMISS_KEY, { value: 'installed', created: Date.now(), atGames: readGamesPlayed() })
  })
}

export function hasNativePrompt(): boolean {
  return deferredPrompt !== null
}

/** Fire Chrome's real install dialog. Returns what the user chose. */
export async function triggerNativePrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable'
  try {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    return outcome
  } catch {
    return 'unavailable'
  }
}

// ---------------------------------------------------------------------------
// display-mode / platform checks
// ---------------------------------------------------------------------------

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    nav.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  )
}

export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator
  const ua = nav.userAgent
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Macintosh') && typeof document !== 'undefined' && 'ontouchend' in document)
  // Chrome/Firefox/Edge on iOS (CriOS/FxiOS/EdgiOS) and in-app webviews can't A2HS.
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua)
  return isIos && isSafari
}

// ---------------------------------------------------------------------------
// completed-games counter
// ---------------------------------------------------------------------------

export function readGamesPlayed(): number {
  const rec = readJson(GAMES_KEY)
  return typeof rec?.value === 'number' && rec.value >= 0 ? rec.value : 0
}

/** Bump the counter (call when a full game's result screen is reached). */
export function recordGamePlayed(): number {
  const now = Date.now()
  const existing = readJson(GAMES_KEY)
  const next = readGamesPlayed() + 1
  writeJson(GAMES_KEY, {
    value: next,
    created: typeof existing?.created === 'number' ? existing.created : now,
    updated: now,
  })
  return next
}

// ---------------------------------------------------------------------------
// dismissal / nag control
// ---------------------------------------------------------------------------

export function dismissForSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

/** "Got it" / "Not now" / a dismissed native prompt all land here. */
export function recordDismissal(): void {
  dismissForSession()
  writeJson(DISMISS_KEY, {
    value: 'dismissed',
    created: Date.now(),
    atGames: readGamesPlayed(),
  })
}

type Variant = 'android' | 'ios' | null

/**
 * Which install UI (if any) to show right now. Assumes it's being asked
 * *because* a game just finished.
 */
export function installVariant(): Variant {
  if (isStandalone()) return null

  try {
    if (sessionStorage.getItem(SESSION_KEY)) return null
  } catch {
    /* ignore */
  }

  const dismissed = readJson(DISMISS_KEY)
  if (dismissed?.value === 'installed') return null
  if (dismissed?.value === 'dismissed') {
    const daysSince = (Date.now() - (Number(dismissed.created) || 0)) / 86_400_000
    const gamesSince = readGamesPlayed() - (Number(dismissed.atGames) || 0)
    if (daysSince < COOLDOWN_DAYS || gamesSince < COOLDOWN_GAMES) return null
  }

  if (isIosSafari()) return 'ios'
  if (deferredPrompt) return 'android'
  return null
}

// ---------------------------------------------------------------------------
// tiny guarded JSON helpers
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>

function readJson(key: string): Rec | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Rec) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: Rec): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota — the prompt just won't remember state */
  }
}
