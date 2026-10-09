import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import PuzzleBoard from './PuzzleBoard.tsx'
import { ClockIcon, EyeIcon, SwapIcon } from './icons.tsx'
import { useCountdown } from '../../hooks/useCountdown.ts'
import { correctCount, isSolved, swapSlots } from '../../puzzleGame/board.ts'
import { PEEK_SECONDS, PREVIEW_SECONDS, gridLabel } from '../../puzzleGame/difficulty.ts'
import { formatClock, scorePuzzle } from '../../puzzleGame/scoring.ts'
import { recordPuzzleGame, type PuzzleGameOutcome } from '../../puzzleGame/storage.ts'
import type { Puzzle, PuzzleResult } from '../../puzzleGame/puzzle.ts'
import type { LiveProgress } from '../../game/live.ts'
import { notifyGameComplete } from '../../game/installPrompt.ts'

type Phase = 'loading' | 'preview' | 'play' | 'complete'

/** How long the "snap together" moment holds before the results screen. */
const COMPLETE_HOLD_MS = 1600

/**
 * One Picture Puzzle, start to solved, inside <GameCard>:
 *
 *   loading → preview (full image, 3 s, tap to skip) → play → complete
 *
 * Records the finished game (best / streak / gallery) and fires the PWA
 * `tinty:game-complete` event the moment the last tile lands, then hands the
 * result to `onFinished` once the solved animation has had its moment — the
 * parent owns the results screen (solo/challenge, daily and live each show a
 * different one). Remount (via `key`) to start fresh.
 */
export default function PuzzleGame({
  puzzle,
  label,
  onFinished,
  onProgress,
  status,
}: {
  puzzle: Puzzle
  /** Small caps label in the header, e.g. "solo" / "daily" / "live". */
  label: string
  onFinished: (result: PuzzleResult, outcome: PuzzleGameOutcome) => void
  /** Called on start and after every swap — live rooms broadcast this. */
  onProgress?: (p: LiveProgress) => void
  /** Replaces the footer's own text during play (live: opponents' progress). */
  status?: ReactNode
}) {
  const { size, image } = puzzle
  const tiles = size * size

  const [phase, setPhase] = useState<Phase>('loading')
  const [board, setBoard] = useState(puzzle.board)
  const [moves, setMoves] = useState(0)
  const [peeks, setPeeks] = useState(0)
  const [peeking, setPeeking] = useState(false)
  const [now, setNow] = useState(0)
  const startedAt = useRef(0)
  const finishedRef = useRef<{ result: PuzzleResult; outcome: PuzzleGameOutcome } | null>(null)

  // Wait for the picture before starting the preview clock, so a slow
  // connection never eats the 3 seconds.
  useEffect(() => {
    let cancelled = false
    const img = new Image()
    const ready = () => !cancelled && setPhase((p) => (p === 'loading' ? 'preview' : p))
    img.onload = ready
    img.onerror = ready
    img.src = image.local_image
    if (img.complete) ready()
    return () => {
      cancelled = true
    }
  }, [image.local_image])

  const elapsed = () => (performance.now() - startedAt.current) / 1000

  const startPlay = useCallback(() => {
    startedAt.current = performance.now()
    setNow(0)
    setPhase('play')
    onProgress?.({ correct: correctCount(puzzle.board), total: tiles, moves: 0, seconds: 0, done: false })
  }, [onProgress, puzzle.board, tiles])

  // Visible clock — ticks a few times a second while playing.
  useEffect(() => {
    if (phase !== 'play') return
    const id = setInterval(() => setNow(elapsed()), 250)
    return () => clearInterval(id)
  }, [phase])

  // Hand off to the parent after the solved moment (tap skips the wait).
  const handOff = useCallback(() => {
    const done = finishedRef.current
    if (!done) return
    finishedRef.current = null
    onFinished(done.result, done.outcome)
  }, [onFinished])

  useEffect(() => {
    if (phase !== 'complete') return
    const id = setTimeout(handOff, COMPLETE_HOLD_MS)
    return () => clearTimeout(id)
  }, [phase, handOff])

  const swap = (a: number, b: number) => {
    if (phase !== 'play') return
    const next = swapSlots(board, a, b)
    const nextMoves = moves + 1
    setBoard(next)
    setMoves(nextMoves)
    const seconds = elapsed()
    const solved = isSolved(next)
    onProgress?.({ correct: correctCount(next), total: tiles, moves: nextMoves, seconds, done: solved })
    if (!solved) return

    setNow(seconds)
    const score = scorePuzzle({
      difficulty: puzzle.difficulty,
      seconds,
      moves: nextMoves,
      optimal: puzzle.optimal,
      peeks,
    })
    const result: PuzzleResult = {
      seed: puzzle.seed,
      difficulty: puzzle.difficulty,
      imageId: image.id,
      score,
      seconds,
      moves: nextMoves,
      optimal: puzzle.optimal,
      peeks,
    }
    const outcome = recordPuzzleGame({ score, difficulty: puzzle.difficulty, imageId: image.id })
    finishedRef.current = { result, outcome }
    notifyGameComplete()
    setPeeking(false)
    setPhase('complete')
  }

  const peek = () => {
    if (phase !== 'play' || peeking) return
    setPeeks((n) => n + 1)
    setPeeking(true)
  }

  useEffect(() => {
    if (!peeking) return
    const id = setTimeout(() => setPeeking(false), PEEK_SECONDS * 1000)
    return () => clearTimeout(id)
  }, [peeking])

  const correct = correctCount(board)

  return (
    <div
      className="screen-in absolute inset-0 flex flex-col"
      onClick={phase === 'complete' ? handOff : undefined}
    >
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-5">
        <span className="text-xs uppercase tracking-widest text-text-dim">
          {gridLabel(puzzle.difficulty)} · {label}
        </span>
        {phase === 'play' || phase === 'complete' ? (
          <div className="flex items-center gap-2">
            <Stat icon={<ClockIcon />} label="Time" value={formatClock(now)} />
            <Stat icon={<SwapIcon />} label="Moves" value={String(moves)} />
            <button
              type="button"
              onClick={peek}
              disabled={phase !== 'play' || peeking}
              aria-label="Peek at the picture (small score penalty)"
              title="Peek — shows the picture for 2s, costs a little score"
              className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 text-xs font-semibold text-text transition-colors hover:border-text-dim disabled:opacity-40"
            >
              <EyeIcon />
              Peek
            </button>
          </div>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1 px-4 [container-type:size]">
        <div
          className="relative mx-auto"
          style={{ width: 'min(100cqw, 100cqh)', height: 'min(100cqw, 100cqh)' }}
        >
          {phase === 'loading' && (
            <div className="size-full animate-pulse rounded-xl bg-surface-2" />
          )}

          {phase === 'preview' && <Preview src={image.local_image} title={image.title} onDone={startPlay} />}

          {(phase === 'play' || phase === 'complete') && (
            <>
              <PuzzleBoard
                size={size}
                src={image.local_image}
                board={board}
                solved={phase === 'complete'}
                disabled={peeking}
                onSwap={swap}
              />
              {phase === 'complete' && (
                <>
                  {/* Once the tiles have snapped together, swap in the whole,
                      unsliced picture so no sub-pixel seams remain. */}
                  <img
                    src={image.local_image}
                    alt={image.title}
                    className="puzzle-solved pointer-events-none absolute inset-0 z-30 size-full object-cover"
                  />
                  <div className="puzzle-sheen pointer-events-none absolute inset-0 z-30" aria-hidden="true" />
                </>
              )}
              {peeking && (
                <button
                  type="button"
                  onClick={() => setPeeking(false)}
                  aria-label="Hide the picture"
                  className="screen-in absolute inset-0 z-40 overflow-hidden rounded-[6px]"
                >
                  <img src={image.local_image} alt="" className="size-full object-cover" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="flex h-12 shrink-0 items-center justify-between gap-3 px-5 text-sm">
        {phase === 'complete' ? (
          <span className="screen-in font-semibold">
            Solved in {formatClock(now)} · {moves} moves
          </span>
        ) : phase === 'play' && status ? (
          status
        ) : phase === 'play' ? (
          <>
            <span className="tabular-nums text-text-dim">
              <span className="font-semibold text-text">{correct}</span> / {tiles} in place
            </span>
            <span className="truncate text-xs text-text-dim">{image.title}</span>
          </>
        ) : (
          <span className="text-text-dim">Get ready…</span>
        )}
      </footer>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <span
      className="flex h-9 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-xs font-semibold tabular-nums"
      aria-label={`${label} ${value}`}
    >
      <span className="text-text-dim">{icon}</span>
      {value}
    </span>
  )
}

/** The memorize step: the whole picture, a 3-second countdown, tap to skip. */
function Preview({ src, title, onDone }: { src: string; title: string; onDone: () => void }) {
  const { remaining, skip } = useCountdown(PREVIEW_SECONDS, onDone)
  return (
    <button
      type="button"
      onClick={skip}
      className="screen-in relative block size-full overflow-hidden rounded-xl text-left"
      aria-label="Tap to start"
    >
      <img src={src} alt={title} className="size-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
        <span>
          <span className="block text-xs uppercase tracking-widest text-white/70">Memorize it</span>
          <span className="block text-sm font-semibold">Tap to start</span>
        </span>
        <span className="text-4xl font-bold tabular-nums">{Math.ceil(remaining)}</span>
      </span>
    </button>
  )
}
