import { useMemo, useState } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import DifficultyToggle from '../ui/DifficultyToggle.tsx'
import { DEFAULT_DIFFICULTY, type Difficulty } from '../../game/difficulty.ts'
import { MAX_SCORE } from '../../game/scoring.ts'
import { activeStreak, loadStats } from '../../game/storage.ts'
import { useNavigate } from 'react-router-dom'

/**
 * The start screen, rendered inside <GameCard>. Choose Solo or With friends,
 * pick a difficulty, or jump to the Daily.
 */
export default function StartScreen() {
  const navigate = useNavigate()
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
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
            Solo or with friends?
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to={`/solo?d=${difficulty}`}>Solo</ButtonLink>
            <Button
              variant="secondary"
              onClick={() => navigate(`/friends?d=${difficulty}`)}
            >
              With friends
            </Button>
          </div>
        </div>

        <DifficultyToggle value={difficulty} onChange={setDifficulty} />

        <ButtonLink to="/daily" variant="secondary">
          Daily challenge
        </ButtonLink>
      </div>
    </div>
  )
}
