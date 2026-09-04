import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DailyGame from '../../routes/DailyGame.tsx'

vi.mock('../../leaderboards/api.ts', () => ({
  fetchBoard: vi.fn().mockResolvedValue([
    { deviceId: 'a', name: 'Zoe', score: 47.5, rank: 1 },
    { deviceId: 'b', name: 'Abe', score: 30, rank: 2 },
  ]),
  fetchMyStanding: vi.fn().mockResolvedValue(null),
  submitScore: vi
    .fn()
    .mockResolvedValue({ rank: 2, total: 7, score: 30, name: 'Bhoni' }),
  subscribeToBoard: vi.fn(() => () => {}),
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

test('intro → play → post name → standing + leaderboard', async () => {
  renderDaily()
  expect(screen.getByRole('heading', { name: 'daily' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Play the daily' }))

  playFullGame()

  expect(await screen.findByText(/daily ·/i)).toBeInTheDocument()

  const nameInput = screen.getByLabelText('Display name for the leaderboard')
  fireEvent.change(nameInput, { target: { value: 'Bhoni' } })
  fireEvent.click(screen.getByRole('button', { name: 'Post to leaderboard' }))

  expect(await screen.findByText('#2')).toBeInTheDocument()
  expect(screen.getByText(/of 7/)).toBeInTheDocument()
  expect(await screen.findByText('Zoe')).toBeInTheDocument()
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

test('an already-posted daily does not offer to post again', () => {
  const ymd = new Date().toISOString().slice(0, 10)
  localStorage.setItem(
    `tinty.daily.${ymd}`,
    JSON.stringify({ score: 22, breakdown: [10, 5, 4, 2, 1], posted: true }),
  )
  renderDaily()
  expect(screen.getByText(/22\.00/)).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /post to leaderboard|post as/i }),
  ).not.toBeInTheDocument()
})
