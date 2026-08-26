import { useMemo } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import DiagonalSwatch from './DiagonalSwatch.tsx'
import HeadToHead from './HeadToHead.tsx'
import ShareButton from './ShareButton.tsx'
import type { RoundResult } from '../../game/gameReducer.ts'
import { MAX_SCORE, totalScore } from '../../game/scoring.ts'
import { scoreCaption } from '../../game/captions.ts'
import { activeStreak, type GameOutcome } from '../../game/storage.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import { MODE_LABEL, type GameMode } from '../../game/mode.ts'

/**
 * Phase 4: the final score out of 50, the five rounds at a glance, personal
 * best / streak, and a one-tap challenge link. On a challenge game it leads
 * with the head-to-head instead.
 */
export default function FinalScreen({
  results,
  difficulty,
  mode,
  seed,
  challengerScore,
  outcome,
  onPlayAgain,
}: {
  results: RoundResult[]
  difficulty: Difficulty
  mode: GameMode
  seed: number
  challengerScore: number | null
  outcome: GameOutcome | null
  onPlayAgain: () => void
}) {
  const total = totalScore(results.map((r) => r.points))
  const caption = useMemo(() => scoreCaption(total), [total])
  const streak = outcome ? activeStreak(outcome.stats) : 0
  const isChallenge = challengerScore !== null

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          {DIFFICULTY_CONFIG[difficulty].label} · {MODE_LABEL[mode]}
        </div>

        {isChallenge ? (
          <HeadToHead you={total} them={challengerScore} />
        ) : (
          <>
            <div className="mt-2 text-5xl font-bold tabular-nums">
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

      <div className="flex flex-col gap-2">
        <ShareButton seed={seed} difficulty={difficulty} score={total} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onPlayAgain}>
            {isChallenge ? 'Try again' : 'Play again'}
          </Button>
          <ButtonLink to="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
