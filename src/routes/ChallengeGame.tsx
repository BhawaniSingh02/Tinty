import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import ColorMatchGame from '../components/game/ColorMatchGame.tsx'
import ChallengeIntro from '../components/game/ChallengeIntro.tsx'
import LiveRoomFlow from '../components/game/LiveRoomFlow.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { parseChallenge } from '../game/share.ts'

/**
 * `/c/:code` — a shared same-seed game. Intro → then either an async game
 * (play the colors, compare scores via the link) or a live room (both online,
 * scores tick in as you go).
 */
export default function ChallengeGame() {
  const { code } = useParams()
  const [params] = useSearchParams()
  const challenge = parseChallenge(code, params)
  const [phase, setPhase] = useState<'intro' | 'async' | 'live'>('intro')
  const [replays, setReplays] = useState(0)

  if (!challenge) {
    return (
      <Layout>
        <GameCard>
          <div className="flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
            <h1 className="text-2xl font-bold">This link looks broken</h1>
            <p className="max-w-xs text-sm text-text-dim">
              The challenge code isn&rsquo;t one we recognize. Want to just play
              a round instead?
            </p>
            <ButtonLink to="/solo">Play a game</ButtonLink>
          </div>
        </GameCard>
      </Layout>
    )
  }

  let body
  if (phase === 'live') {
    body = (
      <LiveRoomFlow
        code={challenge.code}
        difficulty={challenge.difficulty}
        onExit={() => setPhase('intro')}
      />
    )
  } else if (phase === 'async') {
    body = (
      <ColorMatchGame
        key={`${challenge.seed}-${replays}`}
        seed={challenge.seed}
        difficulty={challenge.difficulty}
        mode="challenge"
        challengerScore={challenge.challengerScore}
        onPlayAgain={() => setReplays((n) => n + 1)}
      />
    )
  } else {
    body = (
      <ChallengeIntro
        challenge={challenge}
        onPlayLive={() => setPhase('live')}
        onPlayAsync={() => setPhase('async')}
      />
    )
  }

  return (
    <Layout>
      <GameCard>{body}</GameCard>
    </Layout>
  )
}
