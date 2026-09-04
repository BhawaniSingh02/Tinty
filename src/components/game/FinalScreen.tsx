import { useMemo } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import DiagonalSwatch from './DiagonalSwatch.tsx'
import HeadToHead from './HeadToHead.tsx'
import ShareButton from './ShareButton.tsx'
import PbSubmit from '../leaderboard/PbSubmit.tsx'
import { findCategory } from '../../leaderboards/config.ts'
import type { RoundResult } from '../../game/gameReducer.ts'
import { MAX_SCORE, totalScore } from '../../game/scoring.ts'
import { scoreCaption } from '../../game/captions.ts'
import { activeStreak, type GameOutcome } from '../../game/storage.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import { MODE_LABEL, type GameMode } from '../../game/mode.ts'

/**
 * The end of a game: the score, personal best / streak, a one-tap challenge
 * link — or, on a challenge, the head-to-head with the friend.
 */
export default function FinalScreen({
  results,
  difficulty,
  mode,
  seed,
  challengerScore,
  challengerBreakdown,
  outcome,
  gameNumber,
  onPlayAgain,
}: {
  results: RoundResult[]
  difficulty: Difficulty
  mode: GameMode
  seed: number
  challengerScore: number | null
  challengerBreakdown: number[] | null
  outcome: GameOutcome | null
  gameNumber: number | null
  onPlayAgain: () => void
}) {
  const breakdown = results.map((r) => r.points)
  const total = totalScore(breakdown)
  const caption = useMemo(() => scoreCaption(total), [total])
  const streak = outcome ? activeStreak(outcome.stats) : 0
  const isChallenge = challengerScore !== null
  const category = findCategory(`color:${difficulty}`)

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          {DIFFICULTY_CONFIG[difficulty].label} · {MODE_LABEL[mode]}
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
        <div className="flex gap-2">
          {results.map((r, i) => (
            <DiagonalSwatch
              key={i}
              guess={r.guess}
              target={r.target}
              points={r.points}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {category && (
          <PbSubmit
            category={category}
            score={total}
            breakdown={breakdown}
            isNewBest={outcome?.isNewBest ?? false}
          />
        )}
        <ShareButton
          seed={seed}
          difficulty={difficulty}
          score={total}
          breakdown={breakdown}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onPlayAgain}>
            {isChallenge ? 'Try again' : 'Play again'}
          </Button>
          <ButtonLink to="/" variant="secondary">
            Home
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
