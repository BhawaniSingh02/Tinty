import { contrastText, hsbToCss, type Hsb } from '../../game/color.ts'
import { useCountdown } from '../../hooks/useCountdown.ts'
import RoundCounter from './RoundCounter.tsx'

/**
 * Phase 1: the target color fills the whole card while a countdown ticks.
 * Tap anywhere to hide it early and go to the picker.
 */
export default function RevealScreen({
  color,
  round,
  seconds,
  onDone,
}: {
  color: Hsb
  round: number
  seconds: number
  onDone: () => void
}) {
  const { remaining, skip } = useCountdown(seconds, onDone)
  const tone = contrastText(color)
  const toneText = tone === 'dark' ? 'text-black' : 'text-white'

  return (
    <button
      type="button"
      onClick={skip}
      aria-label="Hide the color and start guessing"
      className="screen-in absolute inset-0 flex cursor-pointer flex-col items-center justify-center"
      style={{ background: hsbToCss(color) }}
    >
      <RoundCounter round={round} tone={tone} />
      <div className={`text-center ${toneText}`}>
        <div className="text-6xl font-bold tabular-nums opacity-90">
          {remaining.toFixed(1)}
        </div>
        <div className="mt-1 text-sm opacity-60">seconds — tap to hide</div>
      </div>
    </button>
  )
}
