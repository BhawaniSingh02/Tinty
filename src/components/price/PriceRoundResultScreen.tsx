import { useMemo } from 'react'
import type { PriceRoundResult } from '../../priceGame/gameReducer.ts'
import { roundCaption } from '../../priceGame/captions.ts'
import { ROUNDS } from '../../priceGame/scoring.ts'
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
      <div className="flex h-12 items-center justify-between gap-3 px-6">
        <span className="text-sm font-semibold tabular-nums text-text-dim">
          {round + 1} / {ROUNDS}
        </span>
        <span className="flex items-baseline gap-2 rounded-full bg-surface-2 px-3 py-1">
          <span className="text-xs text-text-dim">{caption}</span>
          <span className="text-base font-bold tabular-nums">{points}</span>
        </span>
      </div>

      <div className="relative mx-6 flex-1 overflow-hidden rounded-xl bg-surface-2">
        <img
          src={item.local_image ?? item.image_url}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl brightness-90"
        />
        <img
          src={item.local_image ?? item.image_url}
          alt={`${item.brand} ${item.name}`}
          className="relative size-full object-contain p-3"
        />
      </div>

      <div className="flex flex-col gap-3 p-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            {item.brand}
          </div>
          <div className="text-xl font-bold">{item.name}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-14 flex-1 items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 px-4">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-text-dim">
                Your guess
              </div>
              <div className="text-base font-semibold leading-tight tabular-nums">
                {fmt(guess, item.currency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-text-dim">
                Actual price
              </div>
              <div className="text-base font-semibold leading-tight tabular-nums text-accent">
                {fmt(item.price, item.currency)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            aria-label={isLast ? 'See results' : 'Next round'}
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-black shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
