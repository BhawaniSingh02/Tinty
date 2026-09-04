import { useEffect, useMemo, useReducer } from 'react'
import { gameReducer, initialState } from '../../game/gameReducer.ts'
import { notifyGameComplete } from '../../game/installPrompt.ts'
import { generateRounds } from '../../game/palette.ts'
import { ROUNDS, scoreRound } from '../../game/scoring.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'
import RevealScreen from './RevealScreen.tsx'
import HsbPicker from './HsbPicker.tsx'
import RoundResultScreen from './RoundResultScreen.tsx'
import LivePanel from './LivePanel.tsx'
import LiveStandings from './LiveStandings.tsx'

/**
 * The 5-round loop for a live game. Same seed as everyone in the room; each
 * player self-paces after the shared start, broadcasting their score per round.
 * When you finish, the standings screen keeps updating as others do.
 */
export default function LiveGame({
  difficulty,
  room,
}: {
  difficulty: Difficulty
  room: LiveRoom
}) {
  const targets = useMemo(
    () => generateRounds(room.seed, difficulty),
    [room.seed, difficulty],
  )
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { phase, round, guess, results } = state

  useEffect(() => {
    if (phase === 'final') notifyGameComplete()
  }, [phase])

  if (phase === 'final') {
    return (
      <LiveStandings room={room} onRematch={room.isHost ? room.rematch : undefined} />
    )
  }

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
          onSubmit={() => {
            room.submitRound(round, scoreRound(target, guess))
            dispatch({ type: 'submit', target })
          }}
        />
      )

    case 'result':
      return (
        <>
          <RoundResultScreen
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
