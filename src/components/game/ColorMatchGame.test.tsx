import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SoloGame from '../../routes/SoloGame.tsx'

function renderSolo(path = '/solo?d=easy') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SoloGame />
    </MemoryRouter>,
  )
}

test('plays a full 5-round solo game through to the final screen', () => {
  renderSolo()

  for (let round = 1; round <= 5; round++) {
    // reveal
    expect(screen.getByText(`${round} / 5`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))

    // recall
    expect(screen.getAllByRole('slider')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))

    // round result
    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }

  // final
  expect(
    screen.getByRole('button', { name: 'Play again' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/\/ 50/)).toBeInTheDocument()
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
  for (let round = 1; round <= 5; round++) {
    fireEvent.click(screen.getByRole('button', { name: /hide the color/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit color' }))
    fireEvent.click(
      screen.getByRole('button', { name: /next round|see results/i }),
    )
  }
  fireEvent.click(screen.getByRole('button', { name: 'Play again' }))
  expect(screen.getByText('1 / 5')).toBeInTheDocument()
})
