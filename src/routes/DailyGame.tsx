import { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import ColorMatchGame from '../components/game/ColorMatchGame.tsx'
import DailyIntro from '../components/game/DailyIntro.tsx'
import DailyResult from '../components/game/DailyResult.tsx'
import {
  getDailyResult,
  markDailyPlayed,
  todayDaily,
  type DailyOutcome,
} from '../game/daily.ts'

/**
 * `/daily` — one shared color set per UTC day, one attempt. Already played
 * today → straight to the result + leaderboard.
 */
export default function DailyGame() {
  const daily = useMemo(() => todayDaily(), [])
  const [result, setResult] = useState<DailyOutcome | null>(() =>
    getDailyResult(daily.ymd),
  )
  const [playing, setPlaying] = useState(false)

  let body
  if (result) {
    body = (
      <DailyResult
        ymd={daily.ymd}
        score={result.score}
        breakdown={result.breakdown}
      />
    )
  } else if (playing) {
    body = (
      <ColorMatchGame
        seed={daily.seed}
        difficulty={daily.difficulty}
        mode="daily"
        onComplete={(rounds, score) => {
          const outcome = { score, breakdown: rounds.map((r) => r.points) }
          markDailyPlayed(daily.ymd, outcome)
          setResult(outcome)
        }}
        onPlayAgain={() => undefined}
      />
    )
  } else {
    body = <DailyIntro daily={daily} onStart={() => setPlaying(true)} />
  }

  return (
    <Layout>
      <GameCard>{body}</GameCard>
    </Layout>
  )
}
