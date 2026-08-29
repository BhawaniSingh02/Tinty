import { ButtonLink } from '../ui/Button.tsx'
import { MAX_SCORE } from '../../priceGame/scoring.ts'
import { PRICE_ITEMS } from '../../priceGame/items.ts'

/** The Price Check start screen, rendered inside <GameCard>. */
export default function PriceStartScreen() {
  return (
    <div className="flex h-full flex-col justify-between p-7 sm:p-9">
      <div>
        <h1 className="text-4xl font-bold lowercase tracking-tight sm:text-5xl">
          price check
        </h1>
        <p className="mt-4 max-w-sm text-base text-text-dim">
          Five real, branded items. Guess what they actually cost. Five
          rounds, scored out of {MAX_SCORE}.
        </p>

        {PRICE_ITEMS.length > 0 && (
          <p className="mt-4 text-sm text-text-dim">
            <span className="text-text">{PRICE_ITEMS.length}</span> items across{' '}
            <span className="text-text">
              {new Set(PRICE_ITEMS.map((i) => i.category)).size}
            </span>{' '}
            categories
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-4">
        <ButtonLink to="/price/solo">Solo</ButtonLink>
      </div>
    </div>
  )
}
