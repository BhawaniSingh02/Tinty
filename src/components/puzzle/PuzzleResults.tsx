import { useMemo, useState } from 'react'
import { Button } from '../ui/Button.tsx'
import HeadToHead from '../game/HeadToHead.tsx'
import PbSubmit from '../leaderboard/PbSubmit.tsx'
import LeaderboardLink from '../leaderboard/LeaderboardLink.tsx'
import { findCategory } from '../../leaderboards/config.ts'
import { findImage, PUZZLE_THEMES, imagesForTheme, puzzleThumb } from '../../puzzleGame/images.ts'
import { GRID_SIZE, gridLabel } from '../../puzzleGame/difficulty.ts'
import { MAX_SCORE, formatClock } from '../../puzzleGame/scoring.ts'
import { puzzleCaption } from '../../puzzleGame/captions.ts'
import { puzzleActiveStreak, type PuzzleGameOutcome } from '../../puzzleGame/storage.ts'
import {
  copyToClipboard,
  puzzleChallengeUrl,
  puzzleShareText,
  type PuzzleChallengeResult,
} from '../../puzzleGame/share.ts'
import type { PuzzleResult } from '../../puzzleGame/puzzle.ts'

const statLine = (seconds: number | null, moves: number | null) =>
  [seconds !== null ? formatClock(seconds) : null, moves !== null ? `${moves} moves` : null]
    .filter(Boolean)
    .join(' · ')

/**
 * End of a solo or challenge-link puzzle: score /10, time, moves, personal
 * best + streak, gallery progress — or, on a challenge, the head-to-head —
 * then Next puzzle · Share · View leaderboard · Challenge a friend.
 */
export default function PuzzleResults({
  result,
  outcome,
  gameNumber,
  challenger = null,
  onNext,
}: {
  result: PuzzleResult
  outcome: PuzzleGameOutcome
  gameNumber: number | null
  /** A friend's result from the challenge link, if any. */
  challenger?: PuzzleChallengeResult | null
  onNext: () => void
}) {
  const caption = useMemo(() => puzzleCaption(result.score), [result.score])
  const category = findCategory(`puzzle:${result.difficulty}`)!
  const image = findImage(result.imageId)
  const streak = puzzleActiveStreak(outcome.stats)
  const theme = image ? PUZZLE_THEMES.find((t) => t.id === image.theme) : undefined
  const packDone = image
    ? imagesForTheme(image.theme).filter((i) => outcome.stats.completed.includes(i.id)).length
    : 0
  const packSize = image ? imagesForTheme(image.theme).length : 0

  return (
    <div className="screen-in flex h-full flex-col gap-4 overflow-y-auto p-6 sm:p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        picture puzzle · {challenger ? 'challenge' : 'solo'} · {gridLabel(result.difficulty)}
      </div>

      {challenger ? (
        <HeadToHead
          max={MAX_SCORE}
          you={{
            label: 'You',
            total: result.score,
            detail: statLine(result.seconds, result.moves),
          }}
          them={{
            label: 'Them',
            total: challenger.score,
            detail: statLine(challenger.seconds, challenger.moves) || undefined,
          }}
        />
      ) : (
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-6xl font-bold tabular-nums leading-none">
              {result.score.toFixed(2)}
              <span className="ml-1 text-2xl font-semibold text-text-dim">/ {MAX_SCORE}</span>
            </div>
            <p className="mt-2 text-sm text-text-dim">{caption}</p>
          </div>
          {image && (
            <img
              src={puzzleThumb(image)}
              alt={image.title}
              className="size-20 shrink-0 rounded-xl object-cover shadow-lg"
            />
          )}
        </div>
      )}

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Fact label="Time" value={formatClock(result.seconds)} />
        <Fact label="Moves" value={String(result.moves)} sub={`best ${result.optimal}`} />
        <Fact label="Peeks" value={String(result.peeks)} />
      </dl>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {outcome.isNewBest ? (
          <span className="font-semibold text-accent">★ New personal best</span>
        ) : (
          <span className="text-text-dim">
            Best {outcome.previousBest.toFixed(2)} on {gridLabel(result.difficulty)}
          </span>
        )}
        {streak > 0 && <span className="text-text-dim">🔥 {streak} {streak === 1 ? 'day' : 'days'} in a row</span>}
        {theme && (
          <span className="text-text-dim">
            {outcome.newInGallery ? 'New in gallery · ' : ''}
            {theme.label} {packDone}/{packSize}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <PbSubmit
          category={category}
          score={result.score}
          breakdown={[]}
          isNewBest={outcome.isNewBest}
          showLink={false}
        />
        <Button onClick={onNext} className="w-full">
          Next puzzle
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <CopyButton
            idle="Share"
            done="✓ Copied"
            text={() =>
              puzzleShareText({
                score: result.score,
                seconds: result.seconds,
                moves: result.moves,
                size: GRID_SIZE[result.difficulty],
              })
            }
          />
          <LeaderboardLink category={category} label="Leaderboard" className="!px-2" />
          <CopyButton
            idle="Challenge"
            done="✓ Link copied"
            label="Copy a challenge link for a friend"
            text={() =>
              puzzleChallengeUrl(result.seed, result.difficulty, {
                score: result.score,
                seconds: result.seconds,
                moves: result.moves,
              })
            }
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-dim/70">
          {image ? (
            <a href={image.source_url} target="_blank" rel="noreferrer" className="truncate hover:text-text-dim">
              Photo: {image.photographer} / Unsplash
            </a>
          ) : (
            <span />
          )}
          {gameNumber !== null && (
            <span className="shrink-0 tabular-nums">game #{gameNumber.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-2 py-2">
      <dt className="text-[10px] uppercase tracking-wide text-text-dim">{label}</dt>
      <dd className="text-lg font-bold tabular-nums leading-tight">{value}</dd>
      {sub && <dd className="text-[10px] text-text-dim">{sub}</dd>}
    </div>
  )
}

/** Copies text; falls back to a selectable field if the clipboard is blocked. */
export function CopyButton({
  idle,
  done,
  label,
  text,
}: {
  idle: string
  done: string
  label?: string
  text: () => string
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const value = text()
  return (
    <>
      <Button
        variant="secondary"
        aria-label={label}
        className="!px-2"
        onClick={async () => setState((await copyToClipboard(value)) ? 'copied' : 'failed')}
      >
        {state === 'copied' ? done : idle}
      </Button>
      {state === 'failed' && (
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={label ?? idle}
          className="col-span-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-dim"
        />
      )}
    </>
  )
}
