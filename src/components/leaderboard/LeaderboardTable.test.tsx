import { render, screen } from '@testing-library/react'
import LeaderboardTable from './LeaderboardTable.tsx'
import type { BoardEntry } from '../../leaderboards/api.ts'

const rows: BoardEntry[] = [
  { deviceId: 'a', name: 'Zoe', score: 48.12, rank: 1 },
  { deviceId: 'b', name: 'Abe', score: 40.5, rank: 2 },
  { deviceId: 'c', name: 'Cal', score: 33.0, rank: 3 },
  { deviceId: 'me', name: 'Bhoni', score: 12.4, rank: 34 },
]

test('loading shows skeletons, offline + empty show messages', () => {
  const { rerender } = render(
    <LeaderboardTable entries={undefined} myStanding={undefined} deviceId="me" />,
  )
  expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

  rerender(
    <LeaderboardTable entries={null} myStanding={undefined} deviceId="me" />,
  )
  expect(screen.getByText(/offline/i)).toBeInTheDocument()

  rerender(<LeaderboardTable entries={[]} myStanding={null} deviceId="me" />)
  expect(screen.getByText(/be the first/i)).toBeInTheDocument()
})

test('renders rank, name and score', () => {
  render(<LeaderboardTable entries={rows} myStanding={null} deviceId="zzz" />)
  expect(screen.getByText('Zoe')).toBeInTheDocument()
  expect(screen.getByText('48.12')).toBeInTheDocument()
})

test('the current device is shown once (no duplicate pinned row) when visible in the list', () => {
  render(
    <LeaderboardTable
      entries={rows}
      myStanding={{ rank: 34, total: 120, score: 12.4, name: 'Bhoni' }}
      deviceId="me"
    />,
  )
  // Bhoni's row is visible (short list, no scroll) → tagged once, no pinned copy
  expect(screen.getAllByText('(You)')).toHaveLength(1)
  expect(screen.queryByText(/Your rank/i)).not.toBeInTheDocument()
})

test('top 3 rows get a medal accent; lower ranks do not', () => {
  const { container } = render(
    <LeaderboardTable entries={rows} myStanding={null} deviceId="zzz" />,
  )
  const items = container.querySelectorAll('ul > li')
  expect(items[0].getAttribute('style')).toBeTruthy() // rank 1 → medal border/tint
  expect(items[2].getAttribute('style')).toBeTruthy() // rank 3 → medal
  expect(items[3].getAttribute('style')).toBeFalsy() // rank 34 → plain
})

test('pinned row shows "Your rank" when the device is outside the top 50', () => {
  render(
    <LeaderboardTable
      entries={rows.slice(0, 3)}
      myStanding={{ rank: 34, total: 120, score: 12.4, name: 'Bhoni' }}
      deviceId="me"
    />,
  )
  expect(screen.getByText(/Your rank/i)).toBeInTheDocument()
  expect(screen.getByText(/#34 of 120/)).toBeInTheDocument()
  expect(screen.getAllByText('(You)')).toHaveLength(1) // only the pinned row
})

test('pinned row nudges a device with no score yet', () => {
  render(
    <LeaderboardTable
      entries={rows.slice(0, 3)}
      myStanding={null}
      deviceId="me"
    />,
  )
  expect(screen.getByText(/haven.t posted a score here yet/i)).toBeInTheDocument()
})
