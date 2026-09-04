import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GAME_COMPLETE_EVENT,
  installVariant,
  recordDismissal,
  recordGamePlayed,
  triggerNativePrompt,
} from '../../game/installPrompt.ts'

/**
 * The "Add to Home Screen" prompt. It is NEVER shown on load — it waits for a
 * `tinty:game-complete` event (dispatched when a player reaches a final-score
 * screen on Color Match or Price Check), then slides a native-feeling sheet up
 * from the bottom, clear of the score card.
 *
 *   - Android/Chrome: a card with an "Install" button that fires the real
 *     `beforeinstallprompt` we stashed earlier.
 *   - iOS/Safari: a bottom sheet with a dimmed backdrop explaining the
 *     Share → "Add to Home Screen" steps (no native API exists).
 *
 * Dismissal rules live in game/installPrompt.ts (session + 7-day / +3-games
 * cooldown).
 */
type Variant = 'android' | 'ios'

export default function InstallPrompt() {
  const [variant, setVariant] = useState<Variant | null>(null)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const close = useCallback((remember: boolean) => {
    if (remember) recordDismissal()
    setOpen(false)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setVariant(null), 360)
  }, [])

  useEffect(() => {
    function onComplete() {
      recordGamePlayed()
      if (variant) return // already showing
      const v = installVariant()
      if (!v) return
      setVariant(v)
      // Next frame: flip to the open state so the CSS transition runs.
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
    }
    window.addEventListener(GAME_COMPLETE_EVENT, onComplete)
    return () => window.removeEventListener(GAME_COMPLETE_EVENT, onComplete)
  }, [variant])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const onInstall = useCallback(async () => {
    const outcome = await triggerNativePrompt()
    // 'accepted' → appinstalled handles state; 'dismissed'/'unavailable' → stop nagging.
    close(outcome !== 'accepted')
  }, [close])

  if (!variant) return null

  return variant === 'ios' ? (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 install-backdrop"
        data-open={open}
        onClick={() => close(true)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Install Tinty"
        data-open={open}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-card rounded-t-[1.75rem] border border-b-0 border-border bg-surface px-5 pb-8 pt-3 shadow-2xl install-sheet"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-text-dim/30" />
        <div className="flex items-start gap-3.5">
          <ShareGlyph />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-text">Install Tinty</p>
            <p className="mt-1 text-sm leading-relaxed text-text-dim">
              Tap the <span className="font-medium text-text">Share</span> icon in the
              toolbar below, then choose{' '}
              <span className="font-medium text-text">“Add to Home Screen”</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => close(true)}
          className="mt-5 w-full rounded-xl bg-surface-2 py-3 text-sm font-semibold text-text transition-colors hover:bg-border"
        >
          Got it
        </button>
      </div>
    </>
  ) : (
    <div
      role="dialog"
      aria-label="Install Tinty"
      data-open={open}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-card items-center gap-3.5 rounded-card border border-border bg-surface/95 p-3.5 shadow-2xl backdrop-blur install-sheet"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
        <DownloadGlyph />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text">Enjoying Tinty?</p>
        <p className="truncate text-xs text-text-dim">Install it for quick access.</p>
      </div>
      <button
        type="button"
        onClick={() => close(true)}
        aria-label="Not now"
        className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-text-dim hover:text-text"
      >
        ✕
      </button>
      <button
        type="button"
        onClick={onInstall}
        className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Install
      </button>
    </div>
  )
}

function ShareGlyph() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15V4m0 0L8 8m4-4 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function DownloadGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
