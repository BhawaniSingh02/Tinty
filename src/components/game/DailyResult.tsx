import { useEffect, useRef, useState } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import TagInput from './TagInput.tsx'
import Leaderboard from './Leaderboard.tsx'
import { useTimeUntilReset } from '../../hooks/useTimeUntilReset.ts'
import { MAX_SCORE } from '../../game/scoring.ts'
import { getPlayerTag, setPlayerTag } from '../../game/player.ts'
import { getDailyResult, markDailySubmitted } from '../../game/daily.ts'
import {
  fetchDailyLeaderboard,
  fetchStanding,
  submitDailyScore,
  type LeaderboardEntry,
  type Standing,
} from '../../game/leaderboard.ts'

/** Post-daily screen: your score, submit initials once, the leaderboard, countdown. */
export default function DailyResult({
  ymd,
  score,
  breakdown,
}: {
  ymd: string
  score: number
  breakdown: number[]
}) {
  const [tag, setTag] = useState(getPlayerTag)
  const [submitted, setSubmitted] = useState(
    () => getDailyResult(ymd)?.submitted ?? false,
  )
  const [standing, setStanding] = useState<Standing | null>(null)
  const [board, setBoard] = useState<LeaderboardEntry[] | null | undefined>(
    undefined,
  )
  const busy = useRef(false)
  const reset = useTimeUntilReset()

  useEffect(() => {
    fetchDailyLeaderboard(ymd).then(setBoard)
    if (submitted) fetchStanding(ymd, score).then(setStanding)
  }, [ymd, score, submitted])

  const submit = async () => {
    if (busy.current || tag.length === 0) return
    busy.current = true
    setPlayerTag(tag)
    const result = await submitDailyScore({ ymd, tag, score, breakdown })
    if (result) {
      markDailySubmitted(ymd)
      setStanding(result)
      setSubmitted(true)
    }
    setBoard(await fetchDailyLeaderboard(ymd))
    busy.current = false
  }

  return (
    <div className="screen-in flex h-full flex-col gap-4 p-7">
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
        {standing && (
          <p className="mt-1 text-sm font-semibold text-accent">
            #{standing.rank} of {standing.total} today
          </p>
        )}
        {submitted && !standing && (
          <p className="mt-1 text-sm text-text-dim">Posted as {tag || '???'}.</p>
        )}
      </div>

      {!submitted && board !== null && (
        <div className="flex flex-wrap items-center gap-2">
          <TagInput value={tag} onChange={setTag} />
          <Button onClick={submit} disabled={tag.length === 0}>
            Submit score
          </Button>
        </div>
      )}

      <Leaderboard entries={board} youRank={standing?.rank} />

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-text-dim">Next daily in {reset}</span>
        <ButtonLink to="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
