import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import FriendsChooser from '../components/game/FriendsChooser.tsx'
import Seo from '../components/Seo.tsx'
import { parseDifficulty } from '../game/difficulty.ts'
import { randomSeed, seedToCode } from '../game/rng.ts'

/** `/friends` — pick how to play with friends: live round or challenge link. */
export default function FriendsRoute() {
  const [params] = useSearchParams()
  const difficulty = parseDifficulty(params.get('d'))
  const [code] = useState(() => seedToCode(randomSeed()))

  return (
    <Layout>
      <Seo
        path="/friends"
        title="Color Match with friends — challenge a friend | Tinty"
        description="Play the color memory game with friends: send a challenge link or start a live room. Same five colors for everyone, closest match wins."
      />
      <GameCard>
        <FriendsChooser code={code} difficulty={difficulty} />
      </GameCard>
    </Layout>
  )
}
