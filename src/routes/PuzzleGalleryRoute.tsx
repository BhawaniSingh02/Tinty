import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleGallery from '../components/puzzle/PuzzleGallery.tsx'
import Seo from '../components/Seo.tsx'

/** `/puzzle/gallery` — every picture, grouped into packs; solved ones unlocked. */
export default function PuzzleGalleryRoute() {
  return (
    <Layout>
      <Seo
        path="/puzzle/gallery"
        title="Picture Puzzle gallery — collect every photo | Tinty"
        description="Fifty photos across nature, cities, animals, space and food. Solve a picture puzzle to add its photo to your collection."
      />
      <GameCard>
        <PuzzleGallery />
      </GameCard>
    </Layout>
  )
}
