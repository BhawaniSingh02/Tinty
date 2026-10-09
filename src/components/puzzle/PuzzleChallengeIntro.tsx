import { Button } from '../ui/Button.tsx'
import { gridLabel } from '../../puzzleGame/difficulty.ts'
import { MAX_SCORE, formatClock } from '../../puzzleGame/scoring.ts'
import type { ParsedPuzzleChallenge } from '../../puzzleGame/share.ts'

/**
 * The screen before an async Picture Puzzle challenge:
 *  - a friend's played link (score present) → "beat it"
 *  - an unplayed link → "the challenge", play it then send your result back
 */
export default function PuzzleChallengeIntro({
  challenge,
  onStart,
}: {
  challenge: ParsedPuzzleChallenge
  onStart: () => void
}) {
  const friend = challenge.challenger

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        picture puzzle · challenge · {gridLabel(challenge.difficulty)}
      </div>

      {friend ? (
        <>
          <h1 className="mt-2 text-3xl font-bold">Beat your friend</h1>
          <p className="mt-3 text-sm text-text-dim">They solved this exact board and scored</p>
          <div className="mt-3 text-5xl font-bold tabular-nums">
            {friend.score.toFixed(2)}
            <span className="ml-1 text-xl font-semibold text-text-dim">/ {MAX_SCORE}</span>
          </div>
          {(friend.seconds !== null || friend.moves !== null) && (
            <p className="mt-2 text-sm tabular-nums text-text-dim">
              {friend.seconds !== null && formatClock(friend.seconds)}
              {friend.seconds !== null && friend.moves !== null && ' · '}
              {friend.moves !== null && `${friend.moves} moves`}
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="mt-2 text-3xl font-bold">The challenge</h1>
          <p className="mt-3 max-w-sm text-sm text-text-dim">
            One picture, one shuffle — the same for everyone with this link.
            Solve it, then send your result back from the results screen.
          </p>
        </>
      )}

      <div className="mt-auto pt-6">
        <Button onClick={onStart} className="w-full">
          {friend ? 'Beat it' : 'Play the challenge'}
        </Button>
      </div>
    </div>
  )
}
