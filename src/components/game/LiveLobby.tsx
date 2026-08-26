import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import TagInput from './TagInput.tsx'
import { copyToClipboard, liveLink } from '../../game/share.ts'
import { DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-dim">
      {children}
    </span>
  )
}

function Avatar({ tag }: { tag: string }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-text-dim">
      {tag ? tag.slice(0, 1).toUpperCase() : '·'}
    </span>
  )
}

/** The waiting room — set your initials, share the link, host starts. */
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
  const needsTag = tag.length === 0
  const canStart = room.isHost && room.players.length >= 2

  const copy = async () => {
    setCopied(await copyToClipboard(liveLink(code, difficulty)))
  }

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        live · {DIFFICULTY_CONFIG[difficulty].label}
      </div>
      <h1 className="mt-2 text-3xl font-bold">game lobby</h1>
      <p className="mt-2 text-sm text-text-dim">
        Same five colors, closest match wins.
      </p>

      {needsTag && (
        <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4">
          <p className="text-sm font-semibold">Pick your initials</p>
          <p className="mt-0.5 text-xs text-text-dim">
            So your friend knows who they&rsquo;re up against.
          </p>
          <div className="mt-2">
            <TagInput value={tag} onChange={onTag} />
          </div>
        </div>
      )}

      <ul className="mt-5 flex flex-col gap-2.5">
        {room.players.map((p) => {
          const isMe = p.id === room.meId
          return (
            <li key={p.id} className="flex items-center gap-3">
              <Avatar tag={p.tag} />
              <span
                className={`font-semibold ${p.tag ? '' : 'text-text-dim'}`}
              >
                {p.tag || (isMe ? 'you' : 'joining…')}
              </span>
              {p.id === room.hostId && <Badge>host</Badge>}
              {isMe && <Badge>you</Badge>}
            </li>
          )
        })}
        {room.players.length < 2 && (
          <li className="flex items-center gap-3 text-text-dim">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-border">
              <span className="size-1.5 animate-pulse rounded-full bg-text-dim" />
            </span>
            <span className="text-sm">Waiting for another player…</span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button variant="secondary" onClick={copy} className="w-full">
          {copied ? '✓ Link copied — send it over' : 'Copy game link'}
        </Button>
        {room.isHost ? (
          <Button onClick={room.start} disabled={!canStart} className="w-full">
            {canStart ? 'Start match' : 'Waiting for players'}
          </Button>
        ) : (
          <p className="text-center text-xs text-text-dim">
            Waiting for the host to start…
          </p>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="text-center text-xs text-text-dim underline underline-offset-2 hover:text-text"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
