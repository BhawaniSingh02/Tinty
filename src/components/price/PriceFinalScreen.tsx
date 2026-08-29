import { useMemo } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import type { PriceRoundResult } from '../../priceGame/gameReducer.ts'
import { MAX_SCORE, totalScore } from '../../priceGame/scoring.ts'
import { scoreCaption } from '../../priceGame/captions.ts'

/** End of a Price Check game: total score + a round-by-round breakdown. */
export default function PriceFinalScreen({
  results,
  onPlayAgain,
}: {
  results: PriceRoundResult[]
  onPlayAgain: () => void
}) {
  const breakdown = results.map((r) => r.points)
  const total = totalScore(breakdown)
  const caption = useMemo(() => scoreCaption(total), [total])

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          price check · solo
        </div>
        <div className="mt-3 text-6xl font-bold tabular-nums">
          {total}
          <span className="ml-1 text-2xl font-semibold text-text-dim">
            / {MAX_SCORE}
          </span>
        </div>
        <p className="mt-2 text-sm text-text-dim">{caption}</p>
      </div>

      <div className="flex flex-col gap-2">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            <span className="min-w-0 truncate text-text-dim">
              {r.item.brand} {r.item.name}
            </span>
            <span className="ml-2 shrink-0 font-semibold tabular-nums">
              {r.points} / 10
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={onPlayAgain}>
          Play again
        </Button>
        <ButtonLink to="/price" variant="secondary">
          Price check home
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
