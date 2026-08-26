import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import LiveLobby from './LiveLobby.tsx'
import LiveGame from './LiveGame.tsx'
import { getPlayerTag, setPlayerTag } from '../../game/player.ts'
import { useLiveRoom } from '../../hooks/useLiveRoom.ts'
import type { Difficulty } from '../../game/difficulty.ts'

/** Owns the live room connection and switches lobby ↔ game. Rendered in <GameCard>. */
export default function LiveRoomFlow({
  code,
  difficulty,
  onExit,
}: {
  code: string
  difficulty: Difficulty
  onExit: () => void
}) {
  const [tag, setTag] = useState(getPlayerTag)
  const room = useLiveRoom(code, tag)

  const changeTag = (next: string) => {
    setTag(next)
    setPlayerTag(next)
  }

  if (room.status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
        <h1 className="text-2xl font-bold">Live play isn&rsquo;t available</h1>
        <p className="max-w-xs text-sm text-text-dim">
          The realtime server isn&rsquo;t reachable right now. You can still
          send a link and play async.
        </p>
        <Button onClick={onExit}>Back</Button>
      </div>
    )
  }

  if (room.status === 'connecting') {
    return (
      <div className="flex h-full items-center justify-center p-7 text-sm text-text-dim">
        Connecting to the room…
      </div>
    )
  }

  if (room.status === 'lobby') {
    return (
      <LiveLobby
        code={code}
        difficulty={difficulty}
        room={room}
        tag={tag}
        onTag={changeTag}
        onLeave={onExit}
      />
    )
  }

  return <LiveGame key={room.gameNonce} difficulty={difficulty} room={room} />
}
