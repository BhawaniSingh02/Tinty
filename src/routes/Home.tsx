import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import StartScreen from '../components/game/StartScreen.tsx'

export default function Home() {
  return (
    <Layout>
      <GameCard>
        <StartScreen />
      </GameCard>
    </Layout>
  )
}
