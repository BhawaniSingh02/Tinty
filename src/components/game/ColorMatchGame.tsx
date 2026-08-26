import { useMemo, useReducer, useRef, useState } from 'react'
import { gameReducer, initialState } from '../../game/gameReducer.ts'
import { generateRounds } from '../../game/palette.ts'
import { ROUNDS, totalScore } from '../../game/scoring.ts'
import { recordGame, type GameOutcome } from '../../game/storage.ts'
import { bumpGlobalPlays } from '../../game/leaderboard.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import type { RoundResult } from '../../game/gameReducer.ts'
import type { GameMode } from '../../game/mode.ts'
import RevealScreen from './RevealScreen.tsx'
import HsbPicker from './HsbPicker.tsx'
import RoundResultScreen from './RoundResultScreen.tsx'
import FinalScreen from './FinalScreen.tsx'

/**
 * The Color Match loop, driven by one numeric seed. Solo passes a random seed;
 * Challenge and Daily pass a shared one. Renders inside <GameCard>.
 *
 * With `onComplete` the parent owns the end screen (the daily does this);
 * otherwise <FinalScreen> is shown. Remount (via `key`) to start fresh.
 */
export default function ColorMatchGame({
  seed,
  difficulty,
  mode = 'solo',
  challengerScore = null,
  onComplete,
  onPlayAgain,
}: {
  seed: number
  difficulty: Difficulty
  mode?: GameMode
  challengerScore?: number | null
  onComplete?: (results: RoundResult[], score: number) => void
  onPlayAgain: () => void
}) {
  const targets = useMemo(
    () => generateRounds(seed, difficulty),
    [seed, difficulty],
  )
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { phase, round, guess, results } = state
  const target = targets[round]

  const [outcome, setOutcome] = useState<GameOutcome | null>(null)
  const [gameNumber, setGameNumber] = useState<number | null>(null)
  const recordedRef = useRef(false)

  const finishRound = () => {
    if (round === ROUNDS - 1 && !recordedRef.current) {
      recordedRef.current = true
      const score = totalScore(results.map((r) => r.points))
      setOutcome(recordGame({ seed, difficulty, score }))
      void bumpGlobalPlays().then(setGameNumber)
      onComplete?.(results, score)
    }
    dispatch({ type: 'next' })
  }

  switch (phase) {
    case 'reveal':
      return (
        <RevealScreen
          key={`reveal-${round}`}
          color={target}
          round={round}
          seconds={DIFFICULTY_CONFIG[difficulty].memorizeSeconds}
          onDone={() => dispatch({ type: 'startRecall' })}
        />
      )

    case 'recall':
      return (
        <HsbPicker
          key={`recall-${round}`}
          round={round}
          value={guess}
          onChange={(next) => dispatch({ type: 'setGuess', guess: next })}
          onSubmit={() => dispatch({ type: 'submit', target })}
        />
      )

    case 'result':
      return (
        <RoundResultScreen
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
        <FinalScreen
          results={results}
          difficulty={difficulty}
          mode={mode}
          seed={seed}
          challengerScore={challengerScore}
          outcome={outcome}
          gameNumber={gameNumber}
          onPlayAgain={onPlayAgain}
        />
      )
  }
}
