import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { gameReducer, initialState } from '../../game/gameReducer.ts'
import { notifyGameComplete } from '../../game/installPrompt.ts'
import { generateRounds } from '../../game/palette.ts'
import { ROUNDS, scoreRound, totalScore } from '../../game/scoring.ts'
import { personalBest, recordGame } from '../../game/storage.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import { findCategory } from '../../leaderboards/config.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'
import RevealScreen from './RevealScreen.tsx'
import HsbPicker from './HsbPicker.tsx'
import RoundResultScreen from './RoundResultScreen.tsx'
import LivePanel from './LivePanel.tsx'
import LiveStandings, { type LiveMyResult } from './LiveStandings.tsx'

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

  const category = findCategory(`color:${difficulty}`)!
  const [myResult, setMyResult] = useState<LiveMyResult | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (phase !== 'final' || doneRef.current) return
    doneRef.current = true
    notifyGameComplete()
    const breakdown = results.map((r) => r.points)
    const score = totalScore(breakdown)
    const prevBest = personalBest(difficulty)
    recordGame({ seed: room.seed, difficulty, score })
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
