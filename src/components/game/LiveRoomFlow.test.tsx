import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Mock } from 'vitest'
import LiveRoomFlow from './LiveRoomFlow.tsx'
import { useLiveRoom, type LiveRoom } from '../../hooks/useLiveRoom.ts'

vi.mock('../../hooks/useLiveRoom.ts', () => ({ useLiveRoom: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
})

function room(over: Partial<LiveRoom>): LiveRoom {
  return {
    status: 'lobby',
    players: [],
    meId: 'me',
    hostId: 'me',
    isHost: true,
    seed: 123,
    gameNonce: 0,
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
      <LiveRoomFlow code="abc123" difficulty="easy" onExit={vi.fn()} />
    </MemoryRouter>,
  )
}

test('error status offers a way back', () => {
  renderFlow(room({ status: 'error' }))
  expect(screen.getByText(/live play isn.t available/i)).toBeInTheDocument()
})

test('lobby lists players and gates Start until two are present', () => {
  renderFlow(
    room({
      status: 'lobby',
      players: [{ id: 'me', tag: 'ME', joinedAt: 1 }],
    }),
  )
  expect(screen.getByText('ME')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: /waiting for players/i }),
  ).toBeDisabled()
})

test('host can Start with two players', () => {
  const start = vi.fn()
  renderFlow(
    room({
      status: 'lobby',
      start,
      players: [
        { id: 'me', tag: 'ME', joinedAt: 1 },
        { id: 'x', tag: 'XX', joinedAt: 2 },
      ],
    }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Start match' }))
  expect(start).toHaveBeenCalled()
})

test('a non-host waits for the host', () => {
  renderFlow(
    room({
      status: 'lobby',
      isHost: false,
      hostId: 'x',
      players: [
        { id: 'x', tag: 'XX', joinedAt: 1 },
        { id: 'me', tag: 'ME', joinedAt: 2 },
      ],
    }),
  )
  expect(screen.getByText(/waiting for the host/i)).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /start match/i }),
  ).not.toBeInTheDocument()
})

test('playing status renders the game at round 1', () => {
  renderFlow(
    room({
      status: 'playing',
      seed: 999,
      gameNonce: 1,
      players: [
        { id: 'me', tag: 'ME', joinedAt: 1 },
        { id: 'x', tag: 'XX', joinedAt: 2 },
      ],
    }),
  )
  expect(screen.getByText('1 / 5')).toBeInTheDocument()
})
