import { useState } from 'react'
import type { PriceItem } from '../../priceGame/types.ts'
import { ROUNDS } from '../../priceGame/scoring.ts'
import CircleButton from '../game/CircleButton.tsx'
import { TargetIcon } from '../game/icons.tsx'

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
}

/** Phase 1: item image + brand + name, no price — player enters a guess. */
export default function PriceQuestionScreen({
  round,
  item,
  onSubmit,
}: {
  round: number
  item: PriceItem
  onSubmit: (guess: number) => void
}) {
  const [value, setValue] = useState('')
  const symbol = CURRENCY_SYMBOL[item.currency] ?? item.currency + ' '
  const guess = Number(value)
  const canSubmit = value.trim() !== '' && Number.isFinite(guess) && guess >= 0

  const submit = () => {
    if (canSubmit) onSubmit(guess)
  }

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
      </div>

      <div className="flex flex-col gap-3 p-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            {item.brand}
          </div>
          <div className="text-xl font-bold">{item.name}</div>
        </div>

        <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-3 focus-within:border-text-dim">
          <span className="text-lg font-semibold text-text-dim">{symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="Your guess"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full min-w-0 bg-transparent text-lg font-semibold tabular-nums text-text outline-none placeholder:text-text-dim/60"
            aria-label={`Guess the price in ${item.currency}`}
          />
        </label>
      </div>

      <CircleButton onClick={submit} label="Submit guess">
        <TargetIcon />
      </CircleButton>
    </div>
  )
}
