import { useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceFriendsChooser from '../components/price/PriceFriendsChooser.tsx'
import { randomSeed, seedToCode } from '../game/rng.ts'

/** `/price/friends` — pick how to play Price Check with friends: live round or challenge link. */
export default function PriceFriendsRoute() {
  const [code] = useState(() => seedToCode(randomSeed()))

  return (
    <Layout>
      <GameCard>
        <PriceFriendsChooser code={code} />
      </GameCard>
    </Layout>
  )
}
