import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PriceStartScreen from '../components/price/PriceStartScreen.tsx'
import Seo from '../components/Seo.tsx'

export default function PriceHome() {
  return (
    <Layout>
      <Seo
        path="/price"
        title="Price Guess — guess the price game | Tinty"
        description="Five real, branded items — guess what they actually cost. A quick guess the price game to play with friends or solo, free and no sign-up."
      />
      <GameCard>
        <PriceStartScreen />
      </GameCard>
    </Layout>
  )
}
