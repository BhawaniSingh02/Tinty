import { useMemo } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import HeadToHead from '../game/HeadToHead.tsx'
import PriceShareButton from './PriceShareButton.tsx'
import type { PriceRoundResult } from '../../priceGame/gameReducer.ts'
import { MAX_SCORE, totalScore } from '../../priceGame/scoring.ts'
import { scoreCaption } from '../../priceGame/captions.ts'
import { priceActiveStreak, type PriceGameOutcome } from '../../priceGame/storage.ts'
import { MODE_LABEL, type GameMode } from '../../game/mode.ts'

/**
 * End of a Price Check game: the score, personal best / streak, a one-tap
 * challenge link — or, on a challenge, the head-to-head with the friend.
 */
export default function PriceFinalScreen({
  results,
  seed,
  mode,
  challengerScore,
  challengerBreakdown,
  outcome,
  gameNumber,
  onPlayAgain,
}: {
  results: PriceRoundResult[]
  seed: number
  mode: GameMode
  challengerScore: number | null
  challengerBreakdown: number[] | null
  outcome: PriceGameOutcome | null
  gameNumber: number | null
  onPlayAgain: () => void
}) {
  const breakdown = results.map((r) => r.points)
  const total = totalScore(breakdown)
  const caption = useMemo(() => scoreCaption(total), [total])
  const streak = outcome ? priceActiveStreak(outcome.stats) : 0
  const isChallenge = challengerScore !== null

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          price check · {MODE_LABEL[mode]}
        </div>

        {isChallenge ? (
          <div className="mt-3">
            <HeadToHead
              you={{ label: 'You', total, breakdown }}
              them={{
                label: 'Them',
                total: challengerScore,
                breakdown: challengerBreakdown ?? undefined,
              }}
            />
          </div>
        ) : (
          <>
            <div className="mt-3 text-6xl font-bold tabular-nums">
              {total.toFixed(2)}
              <span className="ml-1 text-2xl font-semibold text-text-dim">
                / {MAX_SCORE}
              </span>
            </div>
            <p className="mt-2 text-sm text-text-dim">{caption}</p>

            {outcome && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {outcome.isNewBest ? (
                  <span className="font-semibold text-accent">
                    ★ New personal best
                  </span>
                ) : (
                  <span className="text-text-dim">
                    Best {outcome.previousBest.toFixed(0)} / {MAX_SCORE}
                  </span>
                )}
                {streak > 1 && (
                  <span className="text-text-dim">🔥 {streak}-day streak</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!isChallenge && (
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
                {r.points.toFixed(2)} / 10
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <PriceShareButton seed={seed} score={total} breakdown={breakdown} />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onPlayAgain}>
            {isChallenge ? 'Try again' : 'Play again'}
          </Button>
          <ButtonLink to="/price" variant="secondary">
            Price check home
          </ButtonLink>
          {gameNumber !== null && (
            <span className="ml-auto text-xs tabular-nums text-text-dim/70">
              game #{gameNumber.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
