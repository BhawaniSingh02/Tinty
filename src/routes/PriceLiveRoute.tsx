import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceLiveRoomFlow from '../components/price/PriceLiveRoomFlow.tsx'
import BadCode from '../components/game/BadCode.tsx'
import Seo from '../components/Seo.tsx'
import { codeToSeed } from '../game/rng.ts'

/** `/price/live/:code` — a real-time Price Check room. Join before the round starts. */
export default function PriceLiveRoute() {
  const { code } = useParams()
  const navigate = useNavigate()

  return (
    <Layout>
      <Seo
        noindex
        title="Live Price Guess room | Tinty"
        description="Join a live guess-the-price game — everyone guesses the same five items at once and scores update in real time. Closest guesses win."
      />
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
