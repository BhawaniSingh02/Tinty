import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import StartScreen from '../components/game/StartScreen.tsx'
import Seo from '../components/Seo.tsx'

export default function Home() {
  return (
    <Layout>
      <Seo
        path="/"
        title="Color Match — a color memory game | Tinty"
        description="Watch five colors, then recreate them from memory. A free color memory game you can play solo or challenge a friend — no sign-up."
      />
      <GameCard>
        <StartScreen />
      </GameCard>
    </Layout>
  )
}
