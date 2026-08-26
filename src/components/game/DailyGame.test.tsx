import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DailyGame from '../../routes/DailyGame.tsx'

vi.mock('../../game/leaderboard.ts', () => ({
  submitDailyScore: vi.fn().mockResolvedValue({ rank: 2, total: 7 }),
  fetchDailyLeaderboard: vi.fn().mockResolvedValue([
    { tag: 'ZZZ', score: 47.5, rank: 1 },
    { tag: 'ABC', score: 30, rank: 2 },
  ]),
  fetchStanding: vi.fn().mockResolvedValue({ rank: 2, total: 7 }),
  fetchGlobalPlays: vi.fn().mockResolvedValue(500),
  bumpGlobalPlays: vi.fn().mockResolvedValue(501),
}))

beforeEach(() => {
  localStorage.clear()
})

const renderDaily = () =>
  render(
    <MemoryRouter>
      <DailyGame />
    </MemoryRouter>,
  )

function playFullGame() {
  for (let r = 0; r < 5; r++) {
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))
    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }
}

test('intro → play → submit → standing + leaderboard', async () => {
  renderDaily()
  expect(screen.getByRole('heading', { name: 'daily' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Play the daily' }))

  playFullGame()

  expect(await screen.findByText(/daily ·/i)).toBeInTheDocument()

  const tag = screen.getByLabelText('Your initials')
  fireEvent.change(tag, { target: { value: 'me!' } })
  expect(tag).toHaveValue('ME')

  fireEvent.click(screen.getByRole('button', { name: 'Submit score' }))
  expect(await screen.findByText('#2 of 7 today')).toBeInTheDocument()
  expect(screen.getByText('1. ZZZ')).toBeInTheDocument()
})

test('a second visit the same day skips straight to the result', () => {
  const ymd = new Date().toISOString().slice(0, 10)
  localStorage.setItem(
    `tinty.daily.${ymd}`,
    JSON.stringify({ score: 22, breakdown: [10, 5, 4, 2, 1] }),
  )
  renderDaily()
  expect(screen.getByText(/22\.00/)).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Play the daily' }),
  ).not.toBeInTheDocument()
})

test('an already-submitted daily does not offer submit again', () => {
  const ymd = new Date().toISOString().slice(0, 10)
  localStorage.setItem(
    `tinty.daily.${ymd}`,
    JSON.stringify({ score: 22, breakdown: [10, 5, 4, 2, 1], submitted: true }),
  )
  renderDaily()
  expect(screen.getByText(/22\.00/)).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Submit score' }),
  ).not.toBeInTheDocument()
})
