import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceLiveRoomFlow from '../components/price/PriceLiveRoomFlow.tsx'
import BadCode from '../components/game/BadCode.tsx'
import { codeToSeed } from '../game/rng.ts'

/** `/price/live/:code` — a real-time Price Check room. Join before the round starts. */
export default function PriceLiveRoute() {
  const { code } = useParams()
  const navigate = useNavigate()

  return (
    <Layout>
      <GameCard>
        {code && codeToSeed(code) !== null ? (
          <PriceLiveRoomFlow code={code} onExit={() => navigate('/price')} />
        ) : (
          <BadCode />
        )}
      </GameCard>
    </Layout>
  )
}
