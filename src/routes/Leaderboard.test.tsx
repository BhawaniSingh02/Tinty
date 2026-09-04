import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import Leaderboard from './Leaderboard.tsx'

vi.mock('../leaderboards/api.ts', () => ({
  fetchBoard: vi.fn().mockResolvedValue([]),
  fetchMyStanding: vi.fn().mockResolvedValue(null),
  subscribeToBoard: vi.fn(() => () => {}),
}))

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.search}</div>
}

function renderAt(initial = '/leaderboard') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/leaderboard"
          element={
            <>
              <Leaderboard />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

test('defaults to Color Match → Easy and lists its tabs', () => {
  renderAt()
  expect(screen.getByRole('heading', { name: 'Leaderboards' })).toBeInTheDocument()
  for (const tab of ['Easy', 'Hard', 'Daily']) {
    expect(screen.getByRole('button', { name: tab })).toBeInTheDocument()
  }
  expect(screen.getByRole('button', { name: 'Easy' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('switching game swaps the mode tabs and updates the URL', () => {
  renderAt()
  fireEvent.click(screen.getByRole('button', { name: 'Price Guess' }))
  expect(screen.getByRole('button', { name: 'Solo' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Hard' })).not.toBeInTheDocument()
  expect(screen.getByTestId('loc').textContent).toContain('g=price')
  expect(screen.getByTestId('loc').textContent).toContain('b=price%3Asolo')
})

test('switching mode tab updates the URL', () => {
  renderAt()
  fireEvent.click(screen.getByRole('button', { name: 'Hard' }))
  expect(screen.getByTestId('loc').textContent).toContain('b=color%3Ahard')
})

test('opens on the tab named in ?b=', () => {
  renderAt('/leaderboard?g=price&b=price:daily')
  expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(screen.getByText(/Resets in/i)).toBeInTheDocument()
})

test('focused mode (?focus=1) hides the selector and tabs, shows one board', () => {
  renderAt('/leaderboard?g=color&b=color:hard&focus=1')
  // no game selector, no mode tabs
  expect(
    screen.queryByRole('button', { name: 'Price Guess' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Easy' })).not.toBeInTheDocument()
  // the one board is named, with a way back to the full view
  expect(screen.getByRole('heading', { name: /Color Match\s*Hard/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /all boards/i })).toHaveAttribute(
    'href',
    '/leaderboard',
  )
})

test('focused mode still shows the daily countdown', () => {
  renderAt('/leaderboard?g=color&b=color:daily&focus=1')
  expect(screen.getByText(/Resets in/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Hard' })).not.toBeInTheDocument()
})
