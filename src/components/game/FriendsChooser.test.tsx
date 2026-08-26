import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'

vi.mock('../../lib/supabase.ts', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => null,
}))

beforeEach(() => {
  localStorage.clear()
})

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

test('the friends chooser offers a live round and a challenge link', () => {
  renderAt('/friends?d=hard')
  expect(
    screen.getByRole('heading', { name: 'play with friends' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: /host a live round/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Play it' })).toBeInTheDocument()
})

test('the challenge link is not shown as text until a copy fails', () => {
  renderAt('/friends?d=hard')
  expect(screen.queryByLabelText('Challenge link')).not.toBeInTheDocument()
})

test('"Host a live round" navigates into a live room', () => {
  renderAt('/friends?d=easy')
  fireEvent.click(screen.getByRole('button', { name: /host a live round/i }))
  expect(screen.getByText(/connecting to the room/i)).toBeInTheDocument()
})

test('"Play it" navigates into the challenge game', () => {
  renderAt('/friends?d=easy')
  fireEvent.click(screen.getByRole('button', { name: 'Play it' }))
  expect(
    screen.getByRole('heading', { name: 'The challenge' }),
  ).toBeInTheDocument()
})
