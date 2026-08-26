import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SoloGame from '../../routes/SoloGame.tsx'
import App from '../../App.tsx'

beforeEach(() => {
  localStorage.clear()
})

function renderSolo(path = '/solo?d=easy') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SoloGame />
    </MemoryRouter>,
  )
}

function playFullGame() {
  for (let round = 1; round <= 5; round++) {
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))
    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }
}

test('plays a full 5-round solo game through to the final screen', () => {
  renderSolo()

  for (let round = 1; round <= 5; round++) {
    expect(screen.getByText(`${round} / 5`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))

    expect(screen.getAllByRole('slider')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))

    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }

  expect(
    screen.getByRole('button', { name: 'Play again' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/easy · solo/i)).toBeInTheDocument()
})

test('slider keyboard control changes the HSB value', () => {
  renderSolo()
  fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))

  const hue = screen.getByRole('slider', { name: 'Hue' })
  const before = hue.getAttribute('aria-valuenow')
  fireEvent.keyDown(hue, { key: 'PageUp' })
  expect(hue.getAttribute('aria-valuenow')).not.toBe(before)
})

test('Play again starts a fresh game at round 1', () => {
  renderSolo()
  playFullGame()
  fireEvent.click(screen.getByRole('button', { name: 'Play again' }))
  expect(screen.getByText('1 / 5')).toBeInTheDocument()
})

test('a finished game persists a best score shown back on the start screen', () => {
  const { unmount } = renderSolo()
  playFullGame()
  unmount()

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/best/i)).toBeInTheDocument()
})
