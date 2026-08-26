import { useMemo } from 'react'
import { contrastText, formatHsb, hsbToCss } from '../../game/color.ts'
import type { RoundResult } from '../../game/gameReducer.ts'
import { roundCaption } from '../../game/captions.ts'
import RoundCounter from './RoundCounter.tsx'
import CircleButton from './CircleButton.tsx'
import { ArrowIcon } from './icons.tsx'

/**
 * Phase 3: the card splits — your guess on top, the original below — with the
 * round score and a one-liner. Reticle advances to the next round / results.
 */
export default function RoundResultScreen({
  round,
  result,
  isLast,
  onNext,
}: {
  round: number
  result: RoundResult
  isLast: boolean
  onNext: () => void
}) {
  const { guess, target, points } = result
  const guessTone = contrastText(guess)
  const targetTone = contrastText(target)
  const caption = useMemo(() => roundCaption(points), [points])

  const label = (tone: 'dark' | 'light') =>
    `text-[11px] font-semibold uppercase tracking-wide ${
      tone === 'dark' ? 'text-black/65' : 'text-white/75'
    }`

  return (
    <div className="screen-in absolute inset-0 flex flex-col">
      <div className="relative flex-1" style={{ background: hsbToCss(guess) }}>
        <RoundCounter round={round} tone={guessTone} />
        <div
          className={`absolute right-5 top-4 text-right ${
            guessTone === 'dark' ? 'text-black' : 'text-white'
          }`}
        >
          <div className="text-5xl font-bold tabular-nums">
            {points.toFixed(2)}
          </div>
          <div className="text-sm opacity-70">{caption}</div>
        </div>
        <div className={`absolute bottom-3 left-4 ${label(guessTone)}`}>
          Your selection · {formatHsb(guess)}
        </div>
      </div>

      <div className="relative flex-1" style={{ background: hsbToCss(target) }}>
        <div className={`absolute bottom-3 left-4 ${label(targetTone)}`}>
          Original · {formatHsb(target)}
        </div>
      </div>

      <CircleButton
        onClick={onNext}
        label={isLast ? 'See results' : 'Next round'}
      >
        <ArrowIcon />
      </CircleButton>
    </div>
  )
}
