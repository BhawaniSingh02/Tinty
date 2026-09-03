import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import ColorMatchGame from '../components/game/ColorMatchGame.tsx'
import ChallengeIntro from '../components/game/ChallengeIntro.tsx'
import BadCode from '../components/game/BadCode.tsx'
import Seo from '../components/Seo.tsx'
import { parseChallenge } from '../game/share.ts'

/**
 * `/c/:code` — an async challenge. Play the same five colors as whoever sent
 * the link; if their score is in the URL you get a head-to-head at the end,
 * otherwise you get a link to send your own score back. Fully client-side.
 */
export default function ChallengeGame() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const challenge = parseChallenge(code, params)
  const [started, setStarted] = useState(false)
  const [replays, setReplays] = useState(0)

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
        title="Can you beat my Color Match score? | Tinty"
        description="A friend challenged you to a color memory game — same five colors, closest match wins. Free to play, no sign-up."
      />
      <GameCard>
        {started ? (
          <ColorMatchGame
            key={`${challenge.seed}-${replays}`}
            seed={challenge.seed}
            difficulty={challenge.difficulty}
            mode="challenge"
            challengerScore={challenge.challengerScore}
            challengerBreakdown={challenge.challengerBreakdown}
            onPlayAgain={() => setReplays((n) => n + 1)}
          />
        ) : (
          <ChallengeIntro
            challenge={challenge}
            onStart={() => setStarted(true)}
          />
        )}
      </GameCard>
    </Layout>
  )
}
