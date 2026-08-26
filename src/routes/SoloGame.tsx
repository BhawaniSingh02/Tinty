import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import ColorMatchGame from '../components/game/ColorMatchGame.tsx'
import { parseDifficulty } from '../game/difficulty.ts'
import { randomSeed } from '../game/rng.ts'

export default function SoloGame() {
  const [params] = useSearchParams()
  const difficulty = parseDifficulty(params.get('d'))
  const [seed, setSeed] = useState(randomSeed)

  return (
    <Layout>
      <GameCard>
        <ColorMatchGame
          key={seed}
          seed={seed}
          difficulty={difficulty}
          mode="solo"
          onPlayAgain={() => setSeed(randomSeed())}
        />
      </GameCard>
    </Layout>
  )
}
