import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleFriendsChooser from '../components/puzzle/PuzzleFriendsChooser.tsx'
import Seo from '../components/Seo.tsx'
import { randomSeed, seedToCode } from '../game/rng.ts'
import { parsePuzzleDifficulty } from '../puzzleGame/difficulty.ts'

/** `/puzzle/friends?d=` — pick how to play with friends: live race or challenge link. */
export default function PuzzleFriendsRoute() {
  const [params] = useSearchParams()
  const [code] = useState(() => seedToCode(randomSeed()))

  return (
    <Layout>
      <Seo
        path="/puzzle/friends"
        title="Picture Puzzle with friends — race or challenge | Tinty"
        description="Race a friend on the same picture puzzle in real time, or send a challenge link. Same image, same shuffle, best solve wins."
      />
      <GameCard>
        <PuzzleFriendsChooser code={code} difficulty={parsePuzzleDifficulty(params.get('d'))} />
      </GameCard>
    </Layout>
  )
}
