import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  priceGameReducer,
  initialPriceState,
} from '../../priceGame/gameReducer.ts'
import { notifyGameComplete } from '../../game/installPrompt.ts'
import { generateRounds } from '../../priceGame/rounds.ts'
import { ROUNDS, scoreGuess, totalScore } from '../../priceGame/scoring.ts'
import { loadPriceStats, recordPriceGame } from '../../priceGame/storage.ts'
import { findCategory } from '../../leaderboards/config.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'
import PriceQuestionScreen from './PriceQuestionScreen.tsx'
import PriceRoundResultScreen from './PriceRoundResultScreen.tsx'
import LivePanel from '../game/LivePanel.tsx'
import LiveStandings, { type LiveMyResult } from '../game/LiveStandings.tsx'

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

  const category = findCategory('price:solo')!
  const [myResult, setMyResult] = useState<LiveMyResult | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (phase !== 'final' || doneRef.current) return
    doneRef.current = true
    notifyGameComplete()
    const breakdown = results.map((r) => r.points)
    const score = totalScore(breakdown)
    const prevBest = loadPriceStats().best
    recordPriceGame({ score })
    setMyResult({ score, breakdown, isNewBest: score > prevBest })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'final') {
    return (
      <LiveStandings
        room={room}
        category={category}
        onRematch={room.isHost ? room.rematch : undefined}
        myResult={myResult}
      />
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
