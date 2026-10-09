import { useMemo, useState } from 'react'
import PuzzleGame from './PuzzleGame.tsx'
import PuzzleResults from './PuzzleResults.tsx'
import { generatePuzzle, type PuzzleResult } from '../../puzzleGame/puzzle.ts'
import type { PuzzleDifficulty } from '../../puzzleGame/difficulty.ts'
import type { PuzzleGameOutcome } from '../../puzzleGame/storage.ts'
import type { PuzzleChallengeResult } from '../../puzzleGame/share.ts'
import { bumpGlobalPlays } from '../../game/leaderboard.ts'

/**
 * A solo or challenge-link puzzle: play it, then the results screen. Remount
 * (via `key`) for a new puzzle.
 */
export default function PuzzleSession({
  seed,
  difficulty,
  challenger = null,
  onNext,
}: {
  seed: number
  difficulty: PuzzleDifficulty
  challenger?: PuzzleChallengeResult | null
  onNext: () => void
}) {
  const puzzle = useMemo(() => generatePuzzle(seed, difficulty), [seed, difficulty])
  const [done, setDone] = useState<{ result: PuzzleResult; outcome: PuzzleGameOutcome } | null>(
    null,
  )
  const [gameNumber, setGameNumber] = useState<number | null>(null)

  if (done) {
    return (
      <PuzzleResults
        result={done.result}
        outcome={done.outcome}
        gameNumber={gameNumber}
        challenger={challenger}
        onNext={onNext}
      />
    )
  }

  return (
    <PuzzleGame
      puzzle={puzzle}
      label={challenger ? 'challenge' : 'solo'}
      onFinished={(result, outcome) => {
        setDone({ result, outcome })
        void bumpGlobalPlays().then(setGameNumber)
      }}
    />
  )
}
