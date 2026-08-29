import { useMemo, useReducer } from 'react'
import {
  priceGameReducer,
  initialPriceState,
} from '../../priceGame/gameReducer.ts'
import { generateRounds } from '../../priceGame/rounds.ts'
import { ROUNDS } from '../../priceGame/scoring.ts'
import PriceQuestionScreen from './PriceQuestionScreen.tsx'
import PriceRoundResultScreen from './PriceRoundResultScreen.tsx'
import PriceFinalScreen from './PriceFinalScreen.tsx'

/**
 * The Price Check loop, driven by one numeric seed (same seeded-RNG pattern
 * as Color Match, see game/rng.ts) so a seed can later carry a challenge link
 * or the daily the same way. Renders inside <GameCard>.
 */
export default function PriceCheckGame({
  seed,
  onPlayAgain,
}: {
  seed: number
  onPlayAgain: () => void
}) {
  const rounds = useMemo(() => generateRounds(seed), [seed])
  const [state, dispatch] = useReducer(priceGameReducer, initialPriceState)
  const { phase, round, results } = state
  const item = rounds[round]

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
          onNext={() => dispatch({ type: 'next' })}
        />
      )

    case 'final':
      return <PriceFinalScreen results={results} onPlayAgain={onPlayAgain} />
  }
}
