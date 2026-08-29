import { useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceCheckGame from '../components/price/PriceCheckGame.tsx'
import { randomSeed } from '../game/rng.ts'

export default function PriceSoloGame() {
  const [seed, setSeed] = useState(randomSeed)

  return (
    <Layout>
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
