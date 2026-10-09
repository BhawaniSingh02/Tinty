import { ButtonLink } from '../ui/Button.tsx'
import LeaderboardTable from '../leaderboard/LeaderboardTable.tsx'
import PbSubmit from '../leaderboard/PbSubmit.tsx'
import { useLeaderboard } from '../../leaderboards/useLeaderboard.ts'
import { findCategory } from '../../leaderboards/config.ts'
import { useTimeUntilReset } from '../../hooks/useTimeUntilReset.ts'
import { MAX_SCORE, formatClock } from '../../puzzleGame/scoring.ts'
import { getDeviceId } from '../../game/identity.ts'
import { markPuzzleDailyPosted, type PuzzleDailyOutcome } from '../../puzzleGame/daily.ts'

const CATEGORY = findCategory('puzzle:daily')!

/** Post-daily screen: your result, post it once (name), the leaderboard, countdown. */
export default function PuzzleDailyResult({
  ymd,
  outcome,
}: {
  ymd: string
  outcome: PuzzleDailyOutcome
}) {
  const board = useLeaderboard(CATEGORY)
  const reset = useTimeUntilReset()
  const posted = outcome.posted ?? false

  return (
    <div className="screen-in flex h-full flex-col gap-4 overflow-y-auto p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          picture puzzle · daily · {ymd}
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <div className="text-4xl font-bold tabular-nums">
            {outcome.score.toFixed(2)}
            <span className="ml-1 text-xl font-semibold text-text-dim">/ {MAX_SCORE}</span>
          </div>
          <div className="text-right text-xs tabular-nums text-text-dim">
            {formatClock(outcome.seconds)} · {outcome.moves} moves
            {outcome.peeks > 0 && ` · ${outcome.peeks} peek${outcome.peeks > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      <PbSubmit
        category={CATEGORY}
        score={outcome.score}
        breakdown={[]}
        isNewBest={!posted}
        alreadyPosted={posted}
        onPosted={() => {
          markPuzzleDailyPosted(ymd)
          board.refetch()
        }}
      />

      <div className="min-h-0 flex-1">
        <LeaderboardTable
          entries={board.entries}
          myStanding={board.myStanding}
          deviceId={getDeviceId()}
        />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-xs text-text-dim">Next daily in {reset}</span>
        <ButtonLink to="/puzzle" variant="secondary">
          Puzzle home
        </ButtonLink>
      </div>
    </div>
  )
}
