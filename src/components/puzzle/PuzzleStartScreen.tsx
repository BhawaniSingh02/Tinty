import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../ui/Button.tsx'
import GradientRing from '../ui/GradientRing.tsx'
import DifficultyToggle from '../ui/DifficultyToggle.tsx'
import {
  DEFAULT_PUZZLE_DIFFICULTY,
  GRID_SIZE,
  PUZZLE_DIFFICULTIES,
  type PuzzleDifficulty,
} from '../../puzzleGame/difficulty.ts'
import { MAX_SCORE } from '../../puzzleGame/scoring.ts'
import { loadPuzzleStats, puzzleActiveStreak } from '../../puzzleGame/storage.ts'
import { PUZZLE_IMAGES } from '../../puzzleGame/images.ts'

const SIZE_LABELS = Object.fromEntries(
  PUZZLE_DIFFICULTIES.map((d) => [d, `${d} ${GRID_SIZE[d]}×${GRID_SIZE[d]}`]),
) as Record<PuzzleDifficulty, string>

/** The Picture Puzzle start screen, rendered inside <GameCard>. */
export default function PuzzleStartScreen() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>(DEFAULT_PUZZLE_DIFFICULTY)
  const stats = useMemo(() => loadPuzzleStats(), [])
  const streak = puzzleActiveStreak(stats)
  const best = stats.best[difficulty]

  return (
    <div className="flex h-full flex-col justify-between p-7 sm:p-9">
      <div>
        <h1 className="display text-4xl lowercase sm:text-5xl">picture puzzle</h1>
        <p className="mt-4 max-w-sm text-base text-text-dim">
          A photo, cut into tiles and shuffled. Swap tiles until the picture is
          whole — faster and in fewer moves scores higher, out of {MAX_SCORE}.
        </p>
        <p className="mt-2 flex gap-4 text-sm">
          <Link to="/learn/picture-puzzle" className="text-accent hover:underline">
            How to play &amp; tips
          </Link>
          <Link to="/puzzle/gallery" className="text-accent hover:underline">
            Gallery {stats.completed.length}/{PUZZLE_IMAGES.length}
          </Link>
        </p>

        {(stats.gamesPlayed > 0 || streak > 0) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-dim">
            <span>
              Best <span className="text-text">{best.toFixed(2)}</span> / {MAX_SCORE}
            </span>
            {streak > 0 && (
              <span>
                🔥 <span className="text-text">{streak}</span> {streak === 1 ? 'day' : 'days'} in a
                row
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
            <ButtonLink to={`/puzzle/solo?d=${difficulty}`}>Solo</ButtonLink>
            <Button variant="secondary" onClick={() => navigate(`/puzzle/friends?d=${difficulty}`)}>
              With friends
            </Button>
          </div>
        </div>

        <DifficultyToggle
          value={difficulty}
          onChange={setDifficulty}
          options={PUZZLE_DIFFICULTIES}
          labels={SIZE_LABELS}
        />

        <GradientRing>
          <ButtonLink to="/puzzle/daily" variant="secondary" className="!border-0">
            Daily challenge
          </ButtonLink>
        </GradientRing>
      </div>
    </div>
  )
}
