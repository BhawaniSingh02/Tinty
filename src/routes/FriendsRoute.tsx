import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import FriendsChooser from '../components/game/FriendsChooser.tsx'
import { parseDifficulty } from '../game/difficulty.ts'
import { randomSeed, seedToCode } from '../game/rng.ts'

/** `/friends` — pick how to play with friends: live round or challenge link. */
export default function FriendsRoute() {
  const [params] = useSearchParams()
  const difficulty = parseDifficulty(params.get('d'))
  const [code] = useState(() => seedToCode(randomSeed()))

  return (
    <Layout>
      <GameCard>
        <FriendsChooser code={code} difficulty={difficulty} />
      </GameCard>
    </Layout>
  )
}
