import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  priceGameReducer,
  initialPriceState,
} from '../../priceGame/gameReducer.ts'
import { generateRounds } from '../../priceGame/rounds.ts'
import { ROUNDS, totalScore } from '../../priceGame/scoring.ts'
import { recordPriceGame, type PriceGameOutcome } from '../../priceGame/storage.ts'
import { bumpGlobalPlays } from '../../priceGame/leaderboard.ts'
import type { PriceRoundResult } from '../../priceGame/gameReducer.ts'
import type { GameMode } from '../../game/mode.ts'
import PriceQuestionScreen from './PriceQuestionScreen.tsx'
import PriceRoundResultScreen from './PriceRoundResultScreen.tsx'
import PriceFinalScreen from './PriceFinalScreen.tsx'

/**
 * The Price Check loop, driven by one numeric seed (same seeded-RNG pattern
 * as Color Match, see game/rng.ts) so a seed can carry a challenge link, a
 * live room, or the daily. Renders inside <GameCard>.
 *
 * With `onComplete` the parent owns the end screen (the daily does this);
 * otherwise <PriceFinalScreen> is shown. Remount (via `key`) to start fresh.
 */
export default function PriceCheckGame({
  seed,
  mode = 'solo',
  challengerScore = null,
  challengerBreakdown = null,
  onComplete,
  onPlayAgain,
}: {
  seed: number
  mode?: GameMode
  challengerScore?: number | null
  challengerBreakdown?: number[] | null
  onComplete?: (results: PriceRoundResult[], score: number) => void
  onPlayAgain: () => void
}) {
  const rounds = useMemo(() => generateRounds(seed), [seed])

  // Warm every round's image the moment the game mounts, so by the time the
  // player finishes typing round 1 the rest are already in the browser cache
  // and each screen swap is instant. (Images are now ~60KB WebP.)
  useEffect(() => {
    for (const r of rounds) {
      const img = new Image()
      img.src = r.local_image ?? r.image_url
    }
  }, [rounds])
  const [state, dispatch] = useReducer(priceGameReducer, initialPriceState)
  const { phase, round, results } = state
  const item = rounds[round]

  const [outcome, setOutcome] = useState<PriceGameOutcome | null>(null)
  const [gameNumber, setGameNumber] = useState<number | null>(null)
  const recordedRef = useRef(false)

  const finishRound = () => {
    if (round === ROUNDS - 1 && !recordedRef.current) {
      recordedRef.current = true
      const score = totalScore(results.map((r) => r.points))
      setOutcome(recordPriceGame({ score }))
      void bumpGlobalPlays().then(setGameNumber)
      onComplete?.(results, score)
    }
    dispatch({ type: 'next' })
  }

  switch (phase) {
    case 'question':
      return (
        <PriceQuestionScreen
          key={`question-${round}`}
          round={round}
          item={item}
          onSubmit={(guess) => {
            dispatch({ type: 'setGuess', guess })
            dispatch({ type: 'submit', item })
          }}
        />
      )

    case 'result':
      return (
        <PriceRoundResultScreen
          key={`result-${round}`}
          round={round}
          result={results[results.length - 1]}
          isLast={round === ROUNDS - 1}
          onNext={finishRound}
        />
      )

    case 'final':
      // The daily supplies onComplete and renders its own result screen.
      if (onComplete) return null
      return (
        <PriceFinalScreen
          results={results}
          seed={seed}
          mode={mode}
          challengerScore={challengerScore}
          challengerBreakdown={challengerBreakdown}
          outcome={outcome}
          gameNumber={gameNumber}
          onPlayAgain={onPlayAgain}
        />
      )
  }
}
