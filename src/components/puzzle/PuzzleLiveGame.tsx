import { useMemo, useState } from 'react'
import { Button, ButtonLink } from '../ui/Button.tsx'
import HeadToHead from '../game/HeadToHead.tsx'
import PbSubmit from '../leaderboard/PbSubmit.tsx'
import PuzzleGame from './PuzzleGame.tsx'
import { findCategory } from '../../leaderboards/config.ts'
import { generatePuzzle, type PuzzleResult } from '../../puzzleGame/puzzle.ts'
import { gridLabel, type PuzzleDifficulty } from '../../puzzleGame/difficulty.ts'
import { MAX_SCORE, formatClock } from '../../puzzleGame/scoring.ts'
import type { PuzzleGameOutcome } from '../../puzzleGame/storage.ts'
import type { LiveRoom } from '../../hooks/useLiveRoom.ts'
import type { LiveProgress } from '../../game/live.ts'

interface Opponent {
  id: string
  tag: string
  progress: LiveProgress | undefined
  score: number | undefined
}

function opponents(room: LiveRoom): Opponent[] {
  return room.players
    .filter((p) => p.id !== room.meId)
    .map((p) => ({
      id: p.id,
      tag: p.tag || '???',
      progress: room.progress[p.id],
      score: room.scores[p.id]?.[0],
    }))
}

/**
 * A live Picture Puzzle race. Everyone in the room gets the same image +
 * shuffle (from the room seed) at the same moment. Each swap broadcasts your
 * tile count, so the footer shows "MAX: 12/16 tiles" ticking up live; when
 * you finish, the comparison keeps updating until everyone's done.
 */
export default function PuzzleLiveGame({
  room,
  difficulty,
}: {
  room: LiveRoom
  difficulty: PuzzleDifficulty
}) {
  const puzzle = useMemo(() => generatePuzzle(room.seed, difficulty), [room.seed, difficulty])
  const [mine, setMine] = useState<{ result: PuzzleResult; outcome: PuzzleGameOutcome } | null>(
    null,
  )

  if (mine) return <PuzzleLiveResults room={room} difficulty={difficulty} mine={mine} />

  return (
    <PuzzleGame
      puzzle={puzzle}
      label="live"
      onProgress={room.sendProgress}
      onFinished={(result, outcome) => {
        room.submitRound(0, result.score)
        setMine({ result, outcome })
      }}
      status={<OpponentStrip others={opponents(room)} />}
    />
  )
}

/** Footer during play: each opponent's tiles-in-place, live. */
function OpponentStrip({ others }: { others: Opponent[] }) {
  if (others.length === 0) {
    return <span className="text-xs text-text-dim">Your opponent left the room.</span>
  }
  return (
    <div className="flex w-full flex-col gap-1" aria-live="polite">
      {others.slice(0, 2).map((o) => {
        const p = o.progress
        const pct = p ? (p.correct / p.total) * 100 : 0
        return (
          <div key={o.id} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 truncate font-semibold">
              {o.tag}:{' '}
              <span className="tabular-nums">
                {p?.done ? 'solved!' : p ? `${p.correct}/${p.total} tiles` : 'starting…'}
              </span>
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <span
                className={`block h-full rounded-full transition-[width] duration-300 ${
                  p?.done ? 'bg-accent' : 'bg-text-dim'
                }`}
                style={{ width: `${p?.done ? 100 : pct}%` }}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}

const detail = (p: { seconds: number; moves: number } | undefined) =>
  p ? `${formatClock(p.seconds)} · ${p.moves} moves` : undefined

/** End of a race — updates live as the others finish. */
function PuzzleLiveResults({
  room,
  difficulty,
  mine,
}: {
  room: LiveRoom
  difficulty: PuzzleDifficulty
  mine: { result: PuzzleResult; outcome: PuzzleGameOutcome }
}) {
  const category = findCategory(`puzzle:${difficulty}`)!
  const others = opponents(room)
  const me = room.players.find((p) => p.id === room.meId)
  const myTag = me?.tag || 'You'
  const allDone = others.every((o) => o.score !== undefined)
  const opp = others.length === 1 ? others[0] : null

  return (
    <div className="screen-in flex h-full flex-col gap-4 overflow-y-auto p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        picture puzzle · live · {gridLabel(difficulty)}
      </div>

      {opp ? (
        opp.score !== undefined ? (
          <HeadToHead
            max={MAX_SCORE}
            you={{ label: myTag, total: mine.result.score, detail: detail(mine.result) }}
            them={{ label: opp.tag, total: opp.score, detail: detail(opp.progress) }}
          />
        ) : (
          <div>
            <h1 className="text-3xl font-bold">You finished first</h1>
            <p className="mt-2 text-sm text-text-dim">
              {mine.result.score.toFixed(2)} / {MAX_SCORE} · {detail(mine.result)}
            </p>
            <p className="mt-4 text-sm">
              {opp.tag} is on{' '}
              <span className="font-semibold tabular-nums">
                {opp.progress ? `${opp.progress.correct}/${opp.progress.total}` : '0'}
              </span>{' '}
              tiles…
            </p>
          </div>
        )
      ) : (
        <>
          <h1 className="text-3xl font-bold">{allDone ? 'Final standings' : 'Waiting on others…'}</h1>
          <ol className="flex flex-col gap-1.5 text-sm tabular-nums">
            {[
              { id: room.meId, tag: `${myTag} (you)`, score: mine.result.score as number | undefined, progress: undefined as LiveProgress | undefined },
              ...others,
            ]
              .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
              .map((s, i) => (
                <li
                  key={s.id}
                  className={`flex justify-between ${s.id === room.meId ? 'font-semibold text-accent' : 'text-text-dim'}`}
                >
                  <span>
                    {i + 1}. {s.tag}
                  </span>
                  <span>
                    {s.score !== undefined
                      ? s.score.toFixed(2)
                      : `${s.progress?.correct ?? 0}/${s.progress?.total ?? '?'} tiles`}
                  </span>
                </li>
              ))}
          </ol>
        </>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <PbSubmit
          category={category}
          score={mine.result.score}
          breakdown={[]}
          isNewBest={mine.outcome.isNewBest}
        />
        <div className="flex flex-wrap gap-2">
          {room.isHost && <Button onClick={room.rematch}>Rematch</Button>}
          <ButtonLink to="/puzzle" variant="secondary">
            Puzzle home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
