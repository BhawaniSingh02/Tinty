import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Mock } from 'vitest'
import PuzzleLiveRoomFlow from './PuzzleLiveRoomFlow.tsx'
import { useLiveRoom, type LiveRoom } from '../../hooks/useLiveRoom.ts'
import { generatePuzzle } from '../../puzzleGame/puzzle.ts'

vi.mock('../../hooks/useLiveRoom.ts', () => ({ useLiveRoom: vi.fn() }))

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

function room(over: Partial<LiveRoom>): LiveRoom {
  return {
    status: 'playing',
    players: [
      { id: 'me', tag: 'BHO', joinedAt: 1 },
      { id: 'op', tag: 'MAX', joinedAt: 2 },
    ],
    meId: 'me',
    hostId: 'me',
    isHost: true,
    seed: 777,
    gameNonce: 1,
    scores: {},
    progress: {},
    start: vi.fn(),
    submitRound: vi.fn(),
    sendProgress: vi.fn(),
    rematch: vi.fn(),
    ...over,
  }
}

function renderFlow(r: LiveRoom) {
  ;(useLiveRoom as Mock).mockReturnValue(r)
  return render(
    <MemoryRouter>
      <PuzzleLiveRoomFlow code="abc123" difficulty="medium" onExit={vi.fn()} />
    </MemoryRouter>,
  )
}

const press = (el: HTMLElement) => fireEvent.keyDown(el, { key: 'Enter' })
const tile = (n: number) => screen.getByRole('gridcell', { name: new RegExp(`^Tile ${n},`) })

test('joins a namespaced channel so puzzle rooms never collide with other games', () => {
  renderFlow(room({ status: 'connecting' }))
  expect(useLiveRoom).toHaveBeenCalledWith('abc123', '', 'puzzle-medium-')
})

test('lobby: host can start only once someone joins', () => {
  renderFlow(room({ status: 'lobby', players: [{ id: 'me', tag: 'BHO', joinedAt: 1 }] }))
  expect(screen.getByRole('button', { name: 'Waiting for players' })).toBeDisabled()
  expect(screen.getByText('Medium · 4×4')).toBeInTheDocument()
})

test('during the race the opponent’s tiles-in-place show live, and my swaps are broadcast', () => {
  const r = room({ progress: { op: { correct: 12, total: 16, moves: 9, seconds: 40, done: false } } })
  renderFlow(r)
  fireEvent.click(screen.getByRole('button', { name: 'Tap to start' }))
  expect(screen.getByText('12/16 tiles')).toBeInTheDocument()
  expect(r.sendProgress).toHaveBeenLastCalledWith(expect.objectContaining({ total: 16, moves: 0 }))

  // one swap → broadcast with moves: 1
  const board = generatePuzzle(777, 'medium').board
  const slot = board.findIndex((p, s) => p !== s)
  press(tile(board[slot] + 1))
  press(tile(slot + 1))
  expect(r.sendProgress).toHaveBeenLastCalledWith(expect.objectContaining({ moves: 1, done: false }))
})

test('finishing submits the score; the comparison waits for, then shows, the opponent', () => {
  vi.useFakeTimers()
  const r = room({ progress: { op: { correct: 5, total: 16, moves: 4, seconds: 20, done: false } } })
  const { rerender } = renderFlow(r)
  fireEvent.click(screen.getByRole('button', { name: 'Tap to start' }))

  const board = [...generatePuzzle(777, 'medium').board]
  for (let slot = 0; slot < board.length; slot++) {
    if (board[slot] === slot) continue
    const from = board.indexOf(slot)
    press(tile(board[slot] + 1))
    press(tile(slot + 1))
    ;[board[slot], board[from]] = [board[from], board[slot]]
  }
  act(() => vi.advanceTimersByTime(1700))
  expect(r.submitRound).toHaveBeenCalledWith(0, expect.any(Number))
  expect(screen.getByText('You finished first')).toBeInTheDocument()

  // Opponent finishes → head-to-head with both stat lines
  const done = room({
    ...r,
    scores: { me: [9.5], op: [6.25] },
    progress: { op: { correct: 16, total: 16, moves: 30, seconds: 95, done: true } },
  })
  ;(useLiveRoom as Mock).mockReturnValue(done)
  rerender(
    <MemoryRouter>
      <PuzzleLiveRoomFlow code="abc123" difficulty="medium" onExit={vi.fn()} />
    </MemoryRouter>,
  )
  expect(screen.getByText('MAX')).toBeInTheDocument()
  expect(screen.getByText('6.25')).toBeInTheDocument()
  expect(screen.getByText('1:35 · 30 moves')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Rematch' })).toBeInTheDocument()
  vi.useRealTimers()
})
