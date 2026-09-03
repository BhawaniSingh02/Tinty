import { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceCheckGame from '../components/price/PriceCheckGame.tsx'
import PriceDailyIntro from '../components/price/PriceDailyIntro.tsx'
import PriceDailyResult from '../components/price/PriceDailyResult.tsx'
import Seo from '../components/Seo.tsx'
import {
  getPriceDailyResult,
  markPriceDailyPlayed,
  todayPriceDaily,
  type PriceDailyOutcome,
} from '../priceGame/daily.ts'

/**
 * `/price/daily` — one shared item set per UTC day, one attempt. Already
 * played today → straight to the result + leaderboard.
 */
export default function PriceDailyGame() {
  const daily = useMemo(() => todayPriceDaily(), [])
  const [result, setResult] = useState<PriceDailyOutcome | null>(() =>
    getPriceDailyResult(daily.ymd),
  )
  const [playing, setPlaying] = useState(false)

  let body
  if (result) {
    body = (
      <PriceDailyResult
        ymd={daily.ymd}
        score={result.score}
        breakdown={result.breakdown}
      />
    )
  } else if (playing) {
    body = (
      <PriceCheckGame
        seed={daily.seed}
        mode="daily"
        onComplete={(rounds, score) => {
          const outcome = { score, breakdown: rounds.map((r) => r.points) }
          markPriceDailyPlayed(daily.ymd, outcome)
          setResult(outcome)
        }}
        onPlayAgain={() => undefined}
      />
    )
  } else {
    body = <PriceDailyIntro daily={daily} onStart={() => setPlaying(true)} />
  }

  return (
    <Layout>
      <Seo
        path="/price/daily"
        title="Daily Price Guess challenge | Tinty"
        description="One guess-the-price round a day — the same five items for everyone, one shot each. Post your score to the daily leaderboard."
      />
      <GameCard>{body}</GameCard>
    </Layout>
  )
}
