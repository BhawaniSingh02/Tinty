import { useMemo, useReducer } from 'react'
import { gameReducer, initialState } from '../../game/gameReducer.ts'
import { generateRounds } from '../../game/palette.ts'
import { ROUNDS } from '../../game/scoring.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import RevealScreen from './RevealScreen.tsx'
import HsbPicker from './HsbPicker.tsx'
import RoundResultScreen from './RoundResultScreen.tsx'
import FinalScreen from './FinalScreen.tsx'

/**
 * The Color Match loop, driven by one numeric seed. Solo passes a random seed;
 * Challenge and Daily (later steps) pass a shared one. Renders inside <GameCard>.
 *
 * Remount (via `key`) to start a fresh game.
 */
export default function ColorMatchGame({
  seed,
  difficulty,
  onPlayAgain,
}: {
  seed: number
  difficulty: Difficulty
  onPlayAgain: () => void
}) {
  const targets = useMemo(
    () => generateRounds(seed, difficulty),
    [seed, difficulty],
  )
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { phase, round, guess, results } = state
  const target = targets[round]

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
          onNext={() => dispatch({ type: 'next' })}
        />
      )

    case 'final':
      return (
        <FinalScreen
          results={results}
          difficulty={difficulty}
          onPlayAgain={onPlayAgain}
        />
      )
  }
}
