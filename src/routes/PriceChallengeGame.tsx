import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceCheckGame from '../components/price/PriceCheckGame.tsx'
import PriceChallengeIntro from '../components/price/PriceChallengeIntro.tsx'
import BadCode from '../components/game/BadCode.tsx'
import { parsePriceChallenge } from '../priceGame/share.ts'

/**
 * `/price/c/:code` — an async Price Check challenge. Guess the same five
 * items as whoever sent the link; if their score is in the URL you get a
 * head-to-head at the end, otherwise you get a link to send your own score
 * back. Fully client-side.
 */
export default function PriceChallengeGame() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const challenge = parsePriceChallenge(code, params)
  const [started, setStarted] = useState(false)
  const [replays, setReplays] = useState(0)

  if (!challenge) {
    return (
      <Layout>
        <GameCard>
          <BadCode />
        </GameCard>
      </Layout>
    )
  }

  return (
    <Layout>
      <GameCard>
        {started ? (
          <PriceCheckGame
            key={`${challenge.seed}-${replays}`}
            seed={challenge.seed}
            mode="challenge"
            challengerScore={challenge.challengerScore}
            challengerBreakdown={challenge.challengerBreakdown}
            onPlayAgain={() => setReplays((n) => n + 1)}
          />
        ) : (
          <PriceChallengeIntro
            challenge={challenge}
            onStart={() => setStarted(true)}
          />
        )}
      </GameCard>
    </Layout>
  )
}
