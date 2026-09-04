import { forwardRef, useEffect, useRef, useState } from 'react'
import type { BoardEntry, MyStanding } from '../../leaderboards/api.ts'
import Avatar from './Avatar.tsx'

/**
 * A single leaderboard: rank · avatar · name · score. Top 50 held, ~10 shown
 * then it scrolls. Top 3 get a subtle gold/silver/bronze accent; the current
 * device's row is highlighted and tagged "(You)".
 *
 * The pinned "Your rank" row appears only when the device's own row isn't on
 * screen — either it's outside the top 50, or it's scrolled out of view. When
 * the row is visible in the list, the device is shown once, in place.
 */

const MEDAL = ['#c9a227', '#9aa3b2', '#b06f3c'] // gold · silver · bronze
const VISIBLE_ROWS = 10

const Row = forwardRef<
  HTMLLIElement,
  {
    rank: number
    deviceId: string
    name: string
    score: number
    isMe: boolean
  }
>(function Row({ rank, deviceId, name, score, isMe }, ref) {
  const medal = rank <= 3 ? MEDAL[rank - 1] : null
  return (
    <li
      ref={ref}
      className={[
        'flex items-center gap-3 rounded-lg py-2 pl-2 pr-3 text-sm',
        medal ? 'border-l-2' : 'border-l-2 border-transparent',
        isMe ? 'bg-accent/10 ring-1 ring-inset ring-accent/30' : '',
      ].join(' ')}
      style={medal ? { borderLeftColor: medal, background: `${medal}0f` } : undefined}
    >
      <span
        className="w-7 shrink-0 text-right font-semibold tabular-nums"
        style={medal ? { color: medal } : { color: 'var(--color-text-dim)' }}
      >
        {rank}
      </span>
      <Avatar deviceId={deviceId} name={name} size={28} />
      <span className="min-w-0 flex-1 truncate">
        {name}
        {isMe && <span className="ml-1 text-xs text-accent">(You)</span>}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{score.toFixed(2)}</span>
    </li>
  )
})

function PinnedStanding({
  standing,
  deviceId,
}: {
  standing: MyStanding | null
  deviceId: string
}) {
  return (
    <div className="mt-2 border-t border-border pt-2">
      {standing === null ? (
        <p className="px-2 text-xs text-text-dim">
          You haven&rsquo;t posted a score here yet.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg bg-surface-2 py-2 pl-2 pr-3 text-sm">
            <span className="w-7 shrink-0 text-right font-semibold tabular-nums text-text-dim">
              {standing.rank}
            </span>
            <Avatar deviceId={deviceId} name={standing.name} size={28} />
            <span className="min-w-0 flex-1 truncate">
              {standing.name}
              <span className="ml-1 text-xs text-accent">(You)</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              {standing.score.toFixed(2)}
            </span>
          </div>
          <p className="px-2 pt-1 text-[11px] text-text-dim/70">
            Your rank · #{standing.rank} of {standing.total}
          </p>
        </>
      )}
    </div>
  )
}

export default function LeaderboardTable({
  entries,
  myStanding,
  deviceId,
}: {
  entries: BoardEntry[] | null | undefined
  myStanding: MyStanding | null | undefined
  deviceId: string
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const myRowRef = useRef<HTMLLIElement>(null)

  const list = Array.isArray(entries) ? entries : []
  const inList = list.some((e) => e.deviceId === deviceId)
  const myRank =
    myStanding?.rank ?? list.find((e) => e.deviceId === deviceId)?.rank
  const listFitsWithoutScroll = list.length > 0 && list.length <= VISIBLE_ROWS

  // Whether this device's row is on screen. `io.reported` is set by the
  // IntersectionObserver; until it reports (and in environments without one)
  // fall back to a rank/length heuristic. Reset whenever `entries` changes.
  const [io, setIo] = useState<{ for: unknown; reported: boolean | null }>({
    for: entries,
    reported: null,
  })
  if (io.for !== entries) setIo({ for: entries, reported: null })
  const ioVisible = io.for === entries ? io.reported : null

  const myRowVisible =
    ioVisible ??
    (inList &&
      (listFitsWithoutScroll || (myRank ?? Infinity) <= VISIBLE_ROWS))

  useEffect(() => {
    const root = listRef.current
    const row = myRowRef.current
    if (!inList || !root || !row || typeof IntersectionObserver === 'undefined') {
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => setIo({ for: entries, reported: entry.isIntersecting }),
      { root, threshold: 0.6 },
    )
    obs.observe(row)
    return () => obs.disconnect()
  }, [inList, entries])

  if (entries === undefined) {
    return (
      <ul className="flex flex-col gap-1.5" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li
            key={i}
            className="h-10 animate-pulse rounded-lg bg-surface-2"
            style={{ opacity: 1 - i * 0.13 }}
          />
        ))}
      </ul>
    )
  }

  if (entries === null) {
    return (
      <p className="py-6 text-center text-sm text-text-dim">
        Leaderboard&rsquo;s offline right now — try again in a bit.
      </p>
    )
  }

  if (entries.length === 0) {
    return (
      <div>
        <p className="py-6 text-center text-sm text-text-dim">
          No scores yet — be the first to post one.
        </p>
        {myStanding === null && (
          <PinnedStanding standing={null} deviceId={deviceId} />
        )}
      </div>
    )
  }

  // Show the pinned row only when this device isn't visible in the list.
  const showPinned =
    myStanding === null
      ? true
      : Boolean(myStanding) && (!inList || !myRowVisible)

  return (
    <div className="flex min-h-0 flex-col">
      <ul
        ref={listRef}
        className="flex max-h-[24rem] flex-col gap-1 overflow-y-auto pr-0.5"
      >
        {entries.map((e) => {
          const isMe = e.deviceId === deviceId
          return (
            <Row
              key={e.deviceId}
              ref={isMe ? myRowRef : undefined}
              rank={e.rank}
              deviceId={e.deviceId}
              name={e.name}
              score={e.score}
              isMe={isMe}
            />
          )
        })}
      </ul>
      {showPinned && (
        <PinnedStanding standing={myStanding ?? null} deviceId={deviceId} />
      )}
    </div>
  )
}
