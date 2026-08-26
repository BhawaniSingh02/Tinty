import { useMemo, useState } from 'react'
import { ButtonLink } from '../ui/Button.tsx'
import DifficultyToggle from '../ui/DifficultyToggle.tsx'
import { DEFAULT_DIFFICULTY, type Difficulty } from '../../game/difficulty.ts'
import { MAX_SCORE } from '../../game/scoring.ts'
import { activeStreak, loadStats } from '../../game/storage.ts'

/**
 * The start screen, rendered inside <GameCard>. Mode select grows in step 6
 * (lobby); for now Solo and Daily are live.
 */
export default function StartScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)
  const stats = useMemo(() => loadStats(), [])
  const streak = activeStreak(stats)
  const best = stats.best[difficulty]

  return (
    <div className="flex h-full flex-col justify-between p-7 sm:p-9">
      <div>
        <h1 className="text-4xl font-bold lowercase tracking-tight sm:text-5xl">
          color match
        </h1>
        <p className="mt-4 max-w-sm text-base text-text-dim">
          Watch five colors, then recreate them from memory. Five rounds, scored
          out of 50.
        </p>

        {stats.gamesPlayed > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-dim">
            <span>
              Best <span className="text-text">{best.toFixed(0)}</span> /{' '}
              {MAX_SCORE}
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
        <DifficultyToggle value={difficulty} onChange={setDifficulty} />

        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/solo?d=${difficulty}`}>Play solo</ButtonLink>
          <ButtonLink to="/daily" variant="secondary">
            Daily
          </ButtonLink>
        </div>

        <p className="text-xs text-text-dim/70">
          Finish a game to challenge a friend.
        </p>
      </div>
    </div>
  )
}
