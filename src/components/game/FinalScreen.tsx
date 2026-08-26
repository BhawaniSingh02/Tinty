import { useMemo } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import DiagonalSwatch from './DiagonalSwatch.tsx'
import type { RoundResult } from '../../game/gameReducer.ts'
import { MAX_SCORE, totalScore } from '../../game/scoring.ts'
import { scoreCaption } from '../../game/captions.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'

/**
 * Phase 4: the final score out of 50, the five rounds at a glance, and a way
 * back in. (Challenge-a-friend is added in build step 6.)
 */
export default function FinalScreen({
  results,
  difficulty,
  onPlayAgain,
}: {
  results: RoundResult[]
  difficulty: Difficulty
  onPlayAgain: () => void
}) {
  const total = totalScore(results.map((r) => r.points))
  const caption = useMemo(() => scoreCaption(total), [total])

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          {DIFFICULTY_CONFIG[difficulty].label} · solo
        </div>
        <div className="mt-2 text-5xl font-bold tabular-nums">
          {total.toFixed(2)}
          <span className="ml-1 text-2xl font-semibold text-text-dim">
            / {MAX_SCORE}
          </span>
        </div>
        <p className="mt-2 text-sm text-text-dim">{caption}</p>
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

      <div className="flex flex-wrap gap-2">
        <Button onClick={onPlayAgain}>Play again</Button>
        <ButtonLink to="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
