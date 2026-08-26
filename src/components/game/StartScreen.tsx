import { useState } from 'react'
import { ButtonLink } from '../ui/Button.tsx'
import DifficultyToggle from '../ui/DifficultyToggle.tsx'
import { DEFAULT_DIFFICULTY, type Difficulty } from '../../game/difficulty.ts'

/**
 * The start screen, rendered inside <GameCard>. Mode select grows in build
 * step 4 (real Solo flow) and step 6 (lobby); for now Solo and Daily are live.
 */
export default function StartScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)

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
