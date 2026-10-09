import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PuzzleGame from './PuzzleGame.tsx'
import PuzzleSession from './PuzzleSession.tsx'
import { GAME_COMPLETE_EVENT } from '../../game/installPrompt.ts'
import { loadPuzzleStats } from '../../puzzleGame/storage.ts'
import { generatePuzzle, type Puzzle } from '../../puzzleGame/puzzle.ts'
import { PUZZLE_IMAGES } from '../../puzzleGame/images.ts'

// jsdom never loads images — make every preload resolve immediately.
class InstantImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  complete = true
  src = ''
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('Image', InstantImage)
})
afterEach(() => vi.unstubAllGlobals())

/** A 2×2 that's one swap from solved. */
const nearlySolved: Puzzle = {
  seed: 42,
  difficulty: 'easy',
  size: 2,
  image: PUZZLE_IMAGES[0],
  board: [1, 0, 2, 3],
  optimal: 1,
}

const tile = (n: number) => screen.getByRole('gridcell', { name: new RegExp(`^Tile ${n},`) })
const press = (el: HTMLElement) => fireEvent.keyDown(el, { key: 'Enter' })

test('preview → play → solved: records the game, fires game-complete, hands off the result', () => {
  vi.useFakeTimers()
  const onFinished = vi.fn()
  const onProgress = vi.fn()
  const completed = vi.fn()
  window.addEventListener(GAME_COMPLETE_EVENT, completed)

  render(
    <PuzzleGame puzzle={nearlySolved} label="solo" onFinished={onFinished} onProgress={onProgress} />,
  )

  // Preview with "tap to start"
  fireEvent.click(screen.getByRole('button', { name: 'Tap to start' }))
  expect(onProgress).toHaveBeenLastCalledWith(
    expect.objectContaining({ correct: 2, total: 4, moves: 0, done: false }),
  )

  // Peek shows the picture, then hides itself after 2s
  fireEvent.click(screen.getByRole('button', { name: /Peek/ }))
  expect(screen.getByRole('button', { name: 'Hide the picture' })).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(2100))
  expect(screen.queryByRole('button', { name: 'Hide the picture' })).not.toBeInTheDocument()

  act(() => vi.advanceTimersByTime(3000))
  press(tile(2))
  press(tile(1))

  expect(onProgress).toHaveBeenLastCalledWith(
    expect.objectContaining({ correct: 4, total: 4, moves: 1, done: true }),
  )
  expect(screen.getByText(/Solved in/)).toBeInTheDocument()
  expect(completed).toHaveBeenCalledTimes(1)
  expect(loadPuzzleStats().completed).toEqual([PUZZLE_IMAGES[0].id])

  // Results hand-off waits for the snap-together moment
  expect(onFinished).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1700))
  expect(onFinished).toHaveBeenCalledTimes(1)
  const [result, outcome] = onFinished.mock.calls[0]
  expect(result).toMatchObject({ moves: 1, optimal: 1, peeks: 1, imageId: PUZZLE_IMAGES[0].id })
  expect(result.score).toBeGreaterThan(8)
  expect(result.score).toBeLessThan(10) // the peek cost something
  expect(outcome.isNewBest).toBe(true)

  window.removeEventListener(GAME_COMPLETE_EVENT, completed)
  vi.useRealTimers()
})

test('a full session ends on the results screen with all four actions', () => {
  const puzzle = generatePuzzle(7, 'easy')
  render(
    <MemoryRouter>
      <PuzzleSession seed={7} difficulty="easy" onNext={vi.fn()} />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Tap to start' }))

  // Solve greedily: put each slot's tile home.
  const board = [...puzzle.board]
  for (let slot = 0; slot < board.length; slot++) {
    if (board[slot] === slot) continue
    const from = board.indexOf(slot)
    press(tile(board[slot] + 1))
    press(tile(slot + 1))
    ;[board[slot], board[from]] = [board[from], board[slot]]
  }

  fireEvent.click(screen.getByText(/Solved in/)) // tap to skip the hold
  expect(screen.getByRole('button', { name: 'Next puzzle' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Leaderboard' })).toHaveAttribute(
    'href',
    '/leaderboard?g=puzzle&b=puzzle%3Aeasy&focus=1',
  )
  expect(screen.getByRole('button', { name: /challenge link/i })).toBeInTheDocument()
  expect(screen.getByText(`best ${puzzle.optimal}`)).toBeInTheDocument()
  expect(screen.getByText('★ New personal best')).toBeInTheDocument()
})
