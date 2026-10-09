import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleSession from '../components/puzzle/PuzzleSession.tsx'
import Seo from '../components/Seo.tsx'
import { randomSeed } from '../game/rng.ts'
import { parsePuzzleDifficulty, type PuzzleDifficulty } from '../puzzleGame/difficulty.ts'
import { generatePuzzle } from '../puzzleGame/puzzle.ts'

/** A fresh seed whose picture differs from the one just played. */
function nextSeed(difficulty: PuzzleDifficulty, previous?: number): number {
  const prevImage = previous === undefined ? null : generatePuzzle(previous, difficulty).image.id
  for (let i = 0; i < 20; i++) {
    const seed = randomSeed()
    if (generatePuzzle(seed, difficulty).image.id !== prevImage) return seed
  }
  return randomSeed()
}

/** `/puzzle/solo?d=` — a new random image + shuffle every round. */
export default function PuzzleSoloGame() {
  const [params] = useSearchParams()
  const difficulty = parsePuzzleDifficulty(params.get('d'))
  const [seed, setSeed] = useState(() => nextSeed(difficulty))

  return (
    <Layout>
      <Seo
        path="/puzzle/solo"
        title="Play Picture Puzzle solo | Tinty"
        description="Swap the tiles back into place to rebuild the photo. Faster and fewer moves score higher — a free picture puzzle game online."
      />
      <GameCard>
        <PuzzleSession
          key={`${seed}-${difficulty}`}
          seed={seed}
          difficulty={difficulty}
          onNext={() => setSeed((s) => nextSeed(difficulty, s))}
        />
      </GameCard>
    </Layout>
  )
}
