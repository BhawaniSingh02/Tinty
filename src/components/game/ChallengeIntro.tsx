import { Button } from '../ui/Button.tsx'
import type { ParsedChallenge } from '../../game/share.ts'
import { DIFFICULTY_CONFIG } from '../../game/difficulty.ts'
import { MAX_SCORE } from '../../game/scoring.ts'

/**
 * The screen before an async challenge game:
 *  - a friend's played link (score present) → "beat it"
 *  - an unplayed link → "the challenge", play it then share your score back
 */
export default function ChallengeIntro({
  challenge,
  onStart,
}: {
  challenge: ParsedChallenge
  onStart: () => void
}) {
  const friendScore = challenge.challengerScore

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        {DIFFICULTY_CONFIG[challenge.difficulty].label} · challenge
      </div>

      {friendScore !== null ? (
        <>
          <h1 className="mt-2 text-3xl font-bold">Beat your friend</h1>
          <p className="mt-3 text-sm text-text-dim">
            They played these exact five colors and scored
          </p>
          <div className="mt-3 text-5xl font-bold tabular-nums">
            {friendScore.toFixed(2)}
            <span className="ml-1 text-xl font-semibold text-text-dim">
              / {MAX_SCORE}
            </span>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-2 text-3xl font-bold">The challenge</h1>
          <p className="mt-3 max-w-sm text-sm text-text-dim">
            Five colors, closest match wins. Play them, then send your score back
            from the results screen.
          </p>
        </>
      )}

      <div className="mt-auto pt-6">
        <Button onClick={onStart} className="w-full">
          {friendScore !== null ? 'Beat it' : 'Play the challenge'}
        </Button>
      </div>
    </div>
  )
}
