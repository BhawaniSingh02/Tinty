import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleLiveRoomFlow from '../components/puzzle/PuzzleLiveRoomFlow.tsx'
import BadCode from '../components/game/BadCode.tsx'
import Seo from '../components/Seo.tsx'
import { codeToSeed } from '../game/rng.ts'
import { parsePuzzleDifficulty } from '../puzzleGame/difficulty.ts'

/** `/puzzle/live/:code?d=` — a real-time Picture Puzzle race. Join before it starts. */
export default function PuzzleLiveRoute() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  return (
    <Layout>
      <Seo
        noindex
        title="Live Picture Puzzle race | Tinty"
        description="Join a live picture puzzle race — everyone gets the same image and shuffle at once, and you can watch each other's tiles fall into place."
      />
      <GameCard>
        {code && codeToSeed(code) !== null ? (
          <PuzzleLiveRoomFlow
            code={code}
            difficulty={parsePuzzleDifficulty(params.get('d'))}
            onExit={() => navigate('/puzzle')}
          />
        ) : (
          <BadCode />
        )}
      </GameCard>
    </Layout>
  )
}
