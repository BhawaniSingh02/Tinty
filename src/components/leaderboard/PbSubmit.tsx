import { useEffect, useState } from 'react'
import NamePrompt from './NamePrompt.tsx'
import LeaderboardLink from './LeaderboardLink.tsx'
import {
  fetchMyStanding,
  submitScore,
  type MyStanding,
} from '../../leaderboards/api.ts'
import { dbBoard, type LeaderboardCategory } from '../../leaderboards/config.ts'
import { todayDaily } from '../../game/daily.ts'
import { getDeviceId, getDisplayName, setDisplayName } from '../../game/identity.ts'
import { getPlayerTag } from '../../game/player.ts'

/**
 * The results-screen leaderboard block. Posts a score **only** when it's a new
 * personal best for the mode (or the one daily attempt) and hasn't been posted
 * yet — otherwise it's just a link to the board.
 *
 *   not a PB / not yet beaten → "View leaderboard"
 *   a PB, not posted          → <NamePrompt> → submit → standing
 *   already posted / posted   → "You're #7 of 40" + link
 */
export default function PbSubmit({
  category,
  score,
  breakdown,
  isNewBest,
  alreadyPosted = false,
  onPosted,
}: {
  category: LeaderboardCategory
  score: number
  breakdown: number[]
  isNewBest: boolean
  alreadyPosted?: boolean
  onPosted?: (standing: MyStanding) => void
}) {
  const board = dbBoard(
    category,
    category.kind === 'daily' ? todayDaily().ymd : undefined,
  )
  const [posted, setPosted] = useState(alreadyPosted)
  const [standing, setStanding] = useState<MyStanding | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already posted from a previous visit — pull the current standing to show.
  useEffect(() => {
    if (!posted || standing) return
    void fetchMyStanding(board, getDeviceId()).then((s) => {
      if (s) setStanding(s)
    })
  }, [posted, standing, board])

  const post = async (name: string) => {
    setBusy(true)
    setError(null)
    const result = await submitScore({
      board,
      deviceId: getDeviceId(),
      name,
      score,
      breakdown,
    })
    setBusy(false)
    if (!result) {
      setError('Couldn’t reach the leaderboard — try again.')
      return
    }
    setDisplayName(result.name)
    setStanding(result)
    setPosted(true)
    onPosted?.(result)
  }

  if (isNewBest && !posted) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2/60 p-3">
        <p className="text-xs font-semibold text-accent">
          {category.kind === 'daily'
            ? 'Post your daily score'
            : 'New best — put it on the board'}
        </p>
        <NamePrompt
          savedName={getDisplayName() || getPlayerTag()}
          busy={busy}
          error={error}
          onSubmit={post}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {standing ? (
        <span className="text-sm">
          <span className="font-semibold text-accent">#{standing.rank}</span>
          <span className="text-text-dim"> of {standing.total} · {category.label}</span>
        </span>
      ) : (
        <span className="text-xs text-text-dim">
          {posted ? 'Posted to the board.' : 'Beat your best to make the board.'}
        </span>
      )}
      <LeaderboardLink category={category} />
    </div>
  )
}
