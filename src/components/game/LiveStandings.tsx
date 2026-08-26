import { Button, ButtonLink } from '../ui/Button.tsx'
import { roomStandings } from '../../game/live.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'

/** Room results — updates live as other players finish their rounds. */
export default function LiveStandings({
  room,
  onRematch,
}: {
  room: LiveRoom
  onRematch?: () => void
}) {
  const board = roomStandings(room.players, room.scores)
  const everyoneDone = board.length > 0 && board.every((s) => s.done)
  const winner = everyoneDone ? board[0] : null

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          live · results
        </div>
        <h1 className="mt-2 text-3xl font-bold">
          {winner
            ? winner.id === room.meId
              ? 'You win'
              : `${winner.tag} wins`
            : 'Waiting on others…'}
        </h1>

        <ol className="mt-4 flex flex-col gap-1.5 text-sm tabular-nums">
          {board.map((s, i) => (
            <li
              key={s.id}
              className={`flex justify-between ${
                s.id === room.meId
                  ? 'font-semibold text-accent'
                  : 'text-text-dim'
              }`}
            >
              <span>
                {i + 1}. {s.tag}
                {s.id === room.meId ? ' (you)' : ''}
              </span>
              <span>
                {s.total.toFixed(2)}
                {!s.done && ` · ${s.played}/5`}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2">
        {onRematch && <Button onClick={onRematch}>Rematch</Button>}
        <ButtonLink to="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
