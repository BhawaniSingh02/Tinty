import { useState } from 'react'
import type { PriceItem } from '../../priceGame/types.ts'
import { ROUNDS } from '../../priceGame/scoring.ts'
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
  const [imgLoaded, setImgLoaded] = useState(false)
  const symbol = CURRENCY_SYMBOL[item.currency] ?? item.currency + ' '
  const guess = Number(value)
  const canSubmit = value.trim() !== '' && Number.isFinite(guess) && guess >= 0

  // Keep only digits and a single decimal point — <input type="number"> still
  // lets "e", "+" and "-" through, which isn't a valid price.
  const sanitize = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, '')
    const [whole, ...rest] = cleaned.split('.')
    return rest.length ? `${whole}.${rest.join('')}` : whole
  }

  const submit = () => {
    if (canSubmit) onSubmit(guess)
  }

  return (
    <div className="screen-in absolute inset-0 flex flex-col">
      <div className="flex h-12 items-center px-6 text-sm font-semibold tabular-nums text-text-dim">
        {round + 1} / {ROUNDS}
      </div>

      <div className="relative mx-6 flex-1 overflow-hidden rounded-xl bg-surface-2">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-2 to-surface" />
        )}
        <img
          src={item.local_image ?? item.image_url}
          alt=""
          aria-hidden
          className={`absolute inset-0 size-full scale-110 object-cover blur-2xl brightness-90 transition-opacity duration-200 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src={item.local_image ?? item.image_url}
          alt={`${item.brand} ${item.name}`}
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          className={`relative size-full object-contain p-3 transition-opacity duration-200 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
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
          <label className="flex h-14 flex-1 items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 focus-within:border-text-dim">
            <span className="text-lg font-semibold text-text-dim">{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Your guess"
              value={value}
              onChange={(e) => setValue(sanitize(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-full min-w-0 bg-transparent text-lg font-semibold tabular-nums text-text outline-none placeholder:text-text-dim/60"
              aria-label={`Guess the price in ${item.currency}`}
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Submit guess"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-black shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <TargetIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
