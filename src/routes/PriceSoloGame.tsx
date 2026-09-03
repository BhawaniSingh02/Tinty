import { useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceCheckGame from '../components/price/PriceCheckGame.tsx'
import Seo from '../components/Seo.tsx'
import { randomSeed } from '../game/rng.ts'

export default function PriceSoloGame() {
  const [seed, setSeed] = useState(randomSeed)

  return (
    <Layout>
      <Seo
        path="/price/solo"
        title="Play Price Guess solo — guess the price game | Tinty"
        description="Five real, branded items. Guess what each one actually costs and score how close you get. A free guess-the-price game online."
      />
      <GameCard>
        <PriceCheckGame
          key={seed}
          seed={seed}
          onPlayAgain={() => setSeed(randomSeed())}
        />
      </GameCard>
    </Layout>
  )
}
