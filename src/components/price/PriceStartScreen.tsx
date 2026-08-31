import { useMemo } from 'react'
import { ButtonLink } from '../ui/Button.tsx'
import GradientRing from '../ui/GradientRing.tsx'
import { MAX_SCORE } from '../../priceGame/scoring.ts'
import { loadPriceStats, priceActiveStreak } from '../../priceGame/storage.ts'

/** The Price Check start screen, rendered inside <GameCard>. */
export default function PriceStartScreen() {
  const stats = useMemo(() => loadPriceStats(), [])
  const streak = priceActiveStreak(stats)

  return (
    <div className="flex h-full flex-col justify-between p-7 sm:p-9">
      <div>
        <h1 className="display text-4xl lowercase sm:text-5xl">price guess</h1>
        <p className="mt-4 max-w-sm text-base text-text-dim">
          Five real, branded items. Guess what they actually cost. Five
          rounds, scored out of {MAX_SCORE}.
        </p>

        {stats.gamesPlayed > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-dim">
            <span>
              Best <span className="text-text">{stats.best}</span> / {MAX_SCORE}
            </span>
            {streak > 1 && (
              <span>
                🔥 <span className="text-text">{streak}</span>-day streak
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
            Solo or with friends?
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/price/solo">Solo</ButtonLink>
            <ButtonLink to="/price/friends" variant="secondary">
              With friends
            </ButtonLink>
          </div>
        </div>

        <GradientRing>
          <ButtonLink to="/price/daily" variant="secondary" className="!border-0">
            Daily challenge
          </ButtonLink>
        </GradientRing>
      </div>
    </div>
  )
}
