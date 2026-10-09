import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleStartScreen from '../components/puzzle/PuzzleStartScreen.tsx'
import Seo from '../components/Seo.tsx'

export default function PuzzleHome() {
  return (
    <Layout>
      <Seo
        path="/puzzle"
        title="Picture Puzzle — free online photo swap puzzle | Tinty"
        description="A photo cut into tiles and shuffled — swap them back until the picture is whole. 3×3, 4×4 or 5×5, a daily puzzle, and races against friends. Free, no sign-up."
      />
      <GameCard>
        <PuzzleStartScreen />
      </GameCard>
    </Layout>
  )
}
