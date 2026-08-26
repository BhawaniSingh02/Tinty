import { roomStandings } from '../../game/live.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'

/** Live opponent scores, shown over the between-rounds result screen. */
export default function LivePanel({ room }: { room: LiveRoom }) {
  const others = roomStandings(room.players, room.scores).filter(
    (s) => s.id !== room.meId,
  )
  if (others.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-20 z-20 flex flex-col gap-1">
      {others.map((o) => (
        <div
          key={o.id}
          className="flex justify-between rounded-md bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-sm"
        >
          <span className="font-semibold">{o.tag}</span>
          <span className="tabular-nums">
            {o.total.toFixed(1)} · {o.played}/5
          </span>
        </div>
      ))}
    </div>
  )
}
