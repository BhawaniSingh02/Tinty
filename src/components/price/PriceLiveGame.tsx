import { useEffect, useMemo, useReducer } from 'react'
import {
  priceGameReducer,
  initialPriceState,
} from '../../priceGame/gameReducer.ts'
import { notifyGameComplete } from '../../game/installPrompt.ts'
import { generateRounds } from '../../priceGame/rounds.ts'
import { ROUNDS, scoreGuess } from '../../priceGame/scoring.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'
import PriceQuestionScreen from './PriceQuestionScreen.tsx'
import PriceRoundResultScreen from './PriceRoundResultScreen.tsx'
import LivePanel from '../game/LivePanel.tsx'
import LiveStandings from '../game/LiveStandings.tsx'

/**
 * The 5-round loop for a live Price Check game. Same seed as everyone in the
 * room; each player self-paces after the shared start, broadcasting their
 * score per round. When you finish, the standings screen keeps updating as
 * others do.
 */
export default function PriceLiveGame({ room }: { room: LiveRoom }) {
  const rounds = useMemo(() => generateRounds(room.seed), [room.seed])
  const [state, dispatch] = useReducer(priceGameReducer, initialPriceState)
  const { phase, round, results } = state

  useEffect(() => {
    if (phase === 'final') notifyGameComplete()
  }, [phase])

  if (phase === 'final') {
    return (
      <LiveStandings room={room} onRematch={room.isHost ? room.rematch : undefined} />
    )
  }

  const item = rounds[round]

  switch (phase) {
    case 'question':
      return (
        <PriceQuestionScreen
          key={`question-${round}`}
          round={round}
          item={item}
          onSubmit={(guess) => {
            room.submitRound(round, scoreGuess(item.price, guess))
            dispatch({ type: 'setGuess', guess })
            dispatch({ type: 'submit', item })
          }}
        />
      )

    case 'result':
      return (
        <>
          <PriceRoundResultScreen
            key={`result-${round}`}
            round={round}
            result={results[results.length - 1]}
            isLast={round === ROUNDS - 1}
            onNext={() => dispatch({ type: 'next' })}
          />
          <LivePanel room={room} />
        </>
      )
  }
}
