import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import PuzzleSession from '../components/puzzle/PuzzleSession.tsx'
import PuzzleChallengeIntro from '../components/puzzle/PuzzleChallengeIntro.tsx'
import BadCode from '../components/game/BadCode.tsx'
import Seo from '../components/Seo.tsx'
import { parsePuzzleChallenge } from '../puzzleGame/share.ts'

/**
 * `/puzzle/c/:code?d=` — an async Picture Puzzle challenge. Same image +
 * shuffle as whoever sent the link; with their result in the URL you get a
 * head-to-head at the end. Fully client-side.
 */
export default function PuzzleChallengeGame() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const challenge = parsePuzzleChallenge(code, params)
  const [started, setStarted] = useState(false)

  if (!challenge) {
    return (
      <Layout>
        <GameCard>
          <BadCode />
        </GameCard>
      </Layout>
    )
  }

  return (
    <Layout>
      <Seo
        noindex
        title="Can you beat my Picture Puzzle time? | Tinty"
        description="A friend challenged you to a picture puzzle — same image, same shuffle. Swap the tiles back faster and in fewer moves to win."
      />
      <GameCard>
        {started ? (
          <PuzzleSession
            seed={challenge.seed}
            difficulty={challenge.difficulty}
            challenger={challenge.challenger}
            onNext={() => navigate(`/puzzle/solo?d=${challenge.difficulty}`)}
          />
        ) : (
          <PuzzleChallengeIntro challenge={challenge} onStart={() => setStarted(true)} />
        )}
      </GameCard>
    </Layout>
  )
}
