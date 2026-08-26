import type { LeaderboardEntry } from '../../game/leaderboard.ts'

/**
 * `undefined` = still loading · `null` = offline / unavailable · `[]` = nobody yet.
 */
export default function Leaderboard({
  entries,
  youRank,
}: {
  entries: LeaderboardEntry[] | null | undefined
  youRank?: number
}) {
  if (entries === undefined) {
    return <p className="text-xs text-text-dim">Loading leaderboard…</p>
  }
  if (entries === null) {
    return (
      <p className="text-xs text-text-dim">
        Leaderboard&rsquo;s offline right now — your score is saved on this
        device.
      </p>
    )
  }
  if (entries.length === 0) {
    return (
      <p className="text-xs text-text-dim">Be the first to post a score today.</p>
    )
  }

  return (
    <ol className="flex flex-col gap-1 text-sm tabular-nums">
      {entries.map((e) => (
        <li
          key={`${e.rank}-${e.tag}`}
          className={`flex justify-between ${
            e.rank === youRank
              ? 'font-semibold text-accent'
              : 'text-text-dim'
          }`}
        >
          <span>
            {e.rank}. {e.tag}
          </span>
          <span>{e.score.toFixed(2)}</span>
        </li>
      ))}
    </ol>
  )
}
