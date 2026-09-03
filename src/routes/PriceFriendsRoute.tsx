import { useState } from 'react'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceFriendsChooser from '../components/price/PriceFriendsChooser.tsx'
import Seo from '../components/Seo.tsx'
import { randomSeed, seedToCode } from '../game/rng.ts'

/** `/price/friends` — pick how to play Price Check with friends: live round or challenge link. */
export default function PriceFriendsRoute() {
  const [code] = useState(() => seedToCode(randomSeed()))

  return (
    <Layout>
      <Seo
        path="/price/friends"
        title="Price Guess with friends — challenge a friend | Tinty"
        description="Play the guess-the-price game with friends: send a challenge link or start a live room. Same five items for everyone, closest guesses win."
      />
      <GameCard>
        <PriceFriendsChooser code={code} />
      </GameCard>
    </Layout>
  )
}
