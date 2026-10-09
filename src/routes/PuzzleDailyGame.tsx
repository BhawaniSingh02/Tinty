import { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleGame from '../components/puzzle/PuzzleGame.tsx'
import PuzzleDailyIntro from '../components/puzzle/PuzzleDailyIntro.tsx'
import PuzzleDailyResult from '../components/puzzle/PuzzleDailyResult.tsx'
import Seo from '../components/Seo.tsx'
import { generatePuzzle } from '../puzzleGame/puzzle.ts'
import { bumpGlobalPlays } from '../game/leaderboard.ts'
import {
  getPuzzleDailyResult,
  markPuzzleDailyPlayed,
  todayPuzzleDaily,
  type PuzzleDailyOutcome,
} from '../puzzleGame/daily.ts'

/**
 * `/puzzle/daily` — one image + shuffle per UTC day, the same for everyone,
 * one attempt. Already played today → straight to the result + leaderboard.
 */
export default function PuzzleDailyGame() {
  const daily = useMemo(() => todayPuzzleDaily(), [])
  const puzzle = useMemo(() => generatePuzzle(daily.seed, daily.difficulty), [daily])
  const [result, setResult] = useState<PuzzleDailyOutcome | null>(() =>
    getPuzzleDailyResult(daily.ymd),
  )
  const [playing, setPlaying] = useState(false)

  let body
  if (result) {
    body = <PuzzleDailyResult ymd={daily.ymd} outcome={result} />
  } else if (playing) {
    body = (
      <PuzzleGame
        puzzle={puzzle}
        label="daily"
        onFinished={(r) => {
          const outcome = { score: r.score, seconds: r.seconds, moves: r.moves, peeks: r.peeks }
          markPuzzleDailyPlayed(daily.ymd, outcome)
          void bumpGlobalPlays()
          setResult(outcome)
        }}
      />
    )
  } else {
    body = <PuzzleDailyIntro daily={daily} onStart={() => setPlaying(true)} />
  }

  return (
    <Layout>
      <Seo
        path="/puzzle/daily"
        title="Daily Picture Puzzle | Tinty"
        description="One picture puzzle a day — the same image and shuffle for everyone, one shot. Post your score to the daily leaderboard."
      />
      <GameCard>{body}</GameCard>
    </Layout>
  )
}
