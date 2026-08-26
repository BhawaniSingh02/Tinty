import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import LiveRoomFlow from '../components/game/LiveRoomFlow.tsx'
import BadCode from '../components/game/BadCode.tsx'
import { parseDifficulty } from '../game/difficulty.ts'
import { codeToSeed } from '../game/rng.ts'

/** `/live/:code` — a real-time room. Join before the round starts. */
export default function LiveRoute() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const difficulty = parseDifficulty(params.get('d'))

  return (
    <Layout>
      <GameCard>
        {code && codeToSeed(code) !== null ? (
          <LiveRoomFlow
            code={code}
            difficulty={difficulty}
            onExit={() => navigate('/')}
          />
        ) : (
          <BadCode />
        )}
      </GameCard>
    </Layout>
  )
}
