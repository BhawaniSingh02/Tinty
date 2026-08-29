import { useMemo } from 'react'
import type { PriceRoundResult } from '../../priceGame/gameReducer.ts'
import { roundCaption } from '../../priceGame/captions.ts'
import { ROUNDS } from '../../priceGame/scoring.ts'
import CircleButton from '../game/CircleButton.tsx'
import { ArrowIcon } from '../game/icons.tsx'

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
}

const fmt = (n: number, currency: string) => {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency + ' '
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

/** Phase 2: reveal the player's guess vs the real price, and the round score. */
export default function PriceRoundResultScreen({
  round,
  result,
  isLast,
  onNext,
}: {
  round: number
  result: PriceRoundResult
  isLast: boolean
  onNext: () => void
}) {
  const { item, guess, points } = result
  const caption = useMemo(() => roundCaption(points), [points])

  return (
    <div className="screen-in absolute inset-0 flex flex-col">
      <div className="absolute left-4 top-4 z-10 text-sm font-semibold tabular-nums text-text-dim">
        {round + 1} / {ROUNDS}
      </div>

      <div className="relative flex-1 overflow-hidden bg-surface-2">
        <img
          src={item.local_image ?? item.image_url}
          alt={`${item.brand} ${item.name}`}
          className="size-full object-contain p-6"
        />
        <div className="absolute right-5 top-4 text-right">
          <div className="text-5xl font-bold tabular-nums">{points}</div>
          <div className="text-sm text-text-dim">{caption}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 pr-[4.75rem]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            {item.brand}
          </div>
          <div className="text-xl font-bold">{item.name}</div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-text-dim">
              Your guess
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {fmt(guess, item.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-text-dim">
              Actual price
            </div>
            <div className="text-lg font-semibold tabular-nums text-accent">
              {fmt(item.price, item.currency)}
            </div>
          </div>
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
