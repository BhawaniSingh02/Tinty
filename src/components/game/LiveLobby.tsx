import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import TagInput from './TagInput.tsx'
import { challengeLink, copyToClipboard } from '../../game/share.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-dim">
      {children}
    </span>
  )
}

/** The waiting room — share the link, see who's in, host starts. */
export default function LiveLobby({
  code,
  difficulty,
  room,
  tag,
  onTag,
  onLeave,
}: {
  code: string
  difficulty: Difficulty
  room: LiveRoom
  tag: string
  onTag: (next: string) => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const canStart = room.isHost && room.players.length >= 2

  const copy = async () => {
    setCopied(await copyToClipboard(challengeLink(code, difficulty)))
  }

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          live · {DIFFICULTY_CONFIG[difficulty].label}
        </div>
        <h1 className="mt-2 text-3xl font-bold">game lobby</h1>
        <p className="mt-2 max-w-sm text-sm text-text-dim">
          Same five colors, closest match wins. Send the link to a friend.
        </p>

        <ul className="mt-4 flex flex-col gap-1.5 text-sm">
          {room.players.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="font-semibold">{p.tag || '???'}</span>
              {p.id === room.hostId && <Badge>host</Badge>}
              {p.id === room.meId && <Badge>you</Badge>}
            </li>
          ))}
          {room.players.length < 2 && (
            <li className="text-text-dim">Waiting for another player…</li>
          )}
        </ul>
      </div>

      <div className="flex flex-col items-start gap-3">
        {tag.length === 0 && (
          <label className="text-xs text-text-dim">
            Your initials
            <div className="mt-1">
              <TagInput value={tag} onChange={onTag} />
            </div>
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={copy}>
            {copied ? '✓ Link copied' : 'Copy game link'}
          </Button>
          {room.isHost ? (
            <Button onClick={room.start} disabled={!canStart}>
              {canStart ? 'Start' : 'Waiting for players'}
            </Button>
          ) : (
            <span className="text-xs text-text-dim">
              Waiting for the host to start…
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onLeave}
          className="text-xs text-text-dim underline underline-offset-2 hover:text-text"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
