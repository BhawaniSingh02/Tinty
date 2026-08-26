import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'
import { seedToCode } from '../../game/rng.ts'

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function startChallenge() {
  const btn =
    screen.queryByRole('button', { name: 'Beat it' }) ??
    screen.getByRole('button', { name: 'Just play now' })
  fireEvent.click(btn)
}

function playFullGame() {
  for (let r = 0; r < 5; r++) {
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))
    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }
}

test('a broken challenge code shows a friendly fallback', () => {
  renderAt('/c/not-a-real-code')
  expect(
    screen.getByRole('heading', { name: /looks broken/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Play a game' })).toHaveAttribute(
    'href',
    '/solo',
  )
})

test('a fresh "with friends" link shows the invite intro', () => {
  renderAt(`/c/${seedToCode(500)}?d=easy`)
  expect(
    screen.getByRole('heading', { name: 'Play with a friend' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Share invite link' }),
  ).toBeInTheDocument()
})

test('a played link shows the challenger score and "beat it"', () => {
  renderAt(`/c/${seedToCode(500)}?d=easy&s=45`)
  expect(
    screen.getByRole('heading', { name: 'Beat your friend' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/45\.00/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Beat it' })).toBeInTheDocument()
})

test('the same code renders the same colors for everyone', () => {
  const code = seedToCode(777)
  const { unmount } = renderAt(`/c/${code}`)
  startChallenge()
  const first = screen.getByRole('button', {
    name: /hide the color/i,
  }).style.background
  expect(first).toMatch(/^rgb/)
  unmount()

  renderAt(`/c/${code}`)
  startChallenge()
  expect(
    screen.getByRole('button', { name: /hide the color/i }).style.background,
  ).toBe(first)
})

test('a challenge link plays out and shows the head-to-head', () => {
  renderAt(`/c/${seedToCode(4242)}?d=easy&s=45`)
  startChallenge()
  expect(screen.getByText('1 / 5')).toBeInTheDocument()

  playFullGame()

  expect(screen.getByText('You')).toBeInTheDocument()
  expect(screen.getByText('Them')).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: /you win|them wins|dead heat/i }),
  ).toBeInTheDocument()
  expect(screen.getByText(/easy · challenge/i)).toBeInTheDocument()
})

test('the solo final screen offers a challenge link', () => {
  renderAt('/solo?d=easy')
  playFullGame()
  expect(
    screen.getByRole('button', { name: 'Challenge a friend' }),
  ).toBeInTheDocument()
})
