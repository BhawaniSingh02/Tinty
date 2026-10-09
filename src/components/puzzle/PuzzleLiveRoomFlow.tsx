import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import PuzzleLiveLobby from './PuzzleLiveLobby.tsx'
import PuzzleLiveGame from './PuzzleLiveGame.tsx'
import { getPlayerTag, setPlayerTag } from '../../game/player.ts'
import { useLiveRoom } from '../../hooks/useLiveRoom.ts'
import type { PuzzleDifficulty } from '../../puzzleGame/difficulty.ts'

/** Owns the live room connection and switches lobby ↔ race. Rendered in <GameCard>. */
export default function PuzzleLiveRoomFlow({
  code,
  difficulty,
  onExit,
}: {
  code: string
  difficulty: PuzzleDifficulty
  onExit: () => void
}) {
  const [tag, setTag] = useState(getPlayerTag)
  // Namespaced so a puzzle room never shares a channel with a Color Match /
  // Price room that happens to have the same code.
  const room = useLiveRoom(code, tag, `puzzle-${difficulty}-`)

  const changeTag = (next: string) => {
    setTag(next)
    setPlayerTag(next)
  }

  if (room.status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
        <h1 className="text-2xl font-bold">Live play isn&rsquo;t available</h1>
        <p className="max-w-xs text-sm text-text-dim">
          The realtime server isn&rsquo;t reachable right now. You can still send
          a challenge link and play async.
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
      <PuzzleLiveLobby
        code={code}
        difficulty={difficulty}
        room={room}
        tag={tag}
        onTag={changeTag}
        onLeave={onExit}
      />
    )
  }

  return <PuzzleLiveGame key={room.gameNonce} room={room} difficulty={difficulty} />
}
