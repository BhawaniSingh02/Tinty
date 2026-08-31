import { useEffect, useRef } from 'react'

const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true'
const AD_CLIENT = 'ca-pub-1499405662962074'
const AD_SLOT = '8649485476'

/**
 * The interstitial ad container — card-sized, shown on the between-rounds /
 * lobby-waiting screen only (never during active gameplay, never overlapping
 * the game card). It always reserves its fixed box even with ads disabled so
 * nothing shifts when a real ad loads, and it's themed to match the card.
 *
 * Wired into the round-transition flow in a later build step. There are no
 * banner or side-rail ad slots.
 */
export default function AdSlot() {
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADS_ENABLED || pushed.current) return
    pushed.current = true
    try {
      ;((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []).push({})
    } catch {
      /* adsbygoogle.js not loaded yet — the async loader will fill it in */
    }
  }, [])

  return (
    <div
      data-ad-slot="interstitial"
      aria-hidden="true"
      className="flex aspect-[5/6] w-full max-w-card select-none items-center justify-center overflow-hidden rounded-card border border-border bg-surface"
    >
      {ADS_ENABLED ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <span className="text-[11px] font-medium uppercase tracking-widest text-text-dim/60">
          Ad
        </span>
      )}
    </div>
  )
}
