const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true'

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
  return (
    <div
      data-ad-slot="interstitial"
      aria-hidden="true"
      className="flex aspect-[5/6] w-full max-w-card select-none items-center justify-center overflow-hidden rounded-card border border-border bg-surface"
    >
      {ADS_ENABLED ? (
        // Real ad markup mounts here once a provider is wired up.
        <div data-ad-mount className="h-full w-full" />
      ) : (
        <span className="text-[11px] font-medium uppercase tracking-widest text-text-dim/60">
          Ad
        </span>
      )}
    </div>
  )
}
