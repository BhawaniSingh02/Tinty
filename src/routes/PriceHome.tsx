import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceStartScreen from '../components/price/PriceStartScreen.tsx'

export default function PriceHome() {
  return (
    <Layout>
      <GameCard>
        <PriceStartScreen />
      </GameCard>
    </Layout>
  )
}
