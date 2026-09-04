import { ButtonLink } from '../ui/Button.tsx'
import LeaderboardTable from '../leaderboard/LeaderboardTable.tsx'
import PbSubmit from '../leaderboard/PbSubmit.tsx'
import { useLeaderboard } from '../../leaderboards/useLeaderboard.ts'
import { findCategory } from '../../leaderboards/config.ts'
import { useTimeUntilReset } from '../../hooks/useTimeUntilReset.ts'
import { MAX_SCORE } from '../../game/scoring.ts'
import { getDeviceId } from '../../game/identity.ts'
import { getDailyResult, markDailyPosted } from '../../game/daily.ts'

const CATEGORY = findCategory('color:daily')!

/** Post-daily screen: your score, post it once (name), the leaderboard, countdown. */
export default function DailyResult({
  ymd,
  score,
  breakdown,
}: {
  ymd: string
  score: number
  breakdown: number[]
}) {
  const posted = getDailyResult(ymd)?.posted ?? false
  const board = useLeaderboard(CATEGORY)
  const reset = useTimeUntilReset()

  return (
    <div className="screen-in flex h-full flex-col gap-4 overflow-y-auto p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          daily · {ymd}
        </div>
        <div className="mt-1 text-4xl font-bold tabular-nums">
          {score.toFixed(2)}
          <span className="ml-1 text-xl font-semibold text-text-dim">
            / {MAX_SCORE}
          </span>
        </div>
      </div>

      <PbSubmit
        category={CATEGORY}
        score={score}
        breakdown={breakdown}
        isNewBest={!posted}
        alreadyPosted={posted}
        onPosted={() => {
          markDailyPosted(ymd)
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

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-text-dim">Next daily in {reset}</span>
        <ButtonLink to="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
