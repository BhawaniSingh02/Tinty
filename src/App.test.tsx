import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'

// Smoke test — proves the toolchain (Vitest + jsdom + Tailwind + router) works.
test('renders the home start screen', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('heading', { name: 'color match' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Solo' })).toHaveAttribute(
    'href',
    '/solo?d=easy',
  )
  expect(
    screen.getByRole('button', { name: 'With friends' }),
  ).toBeInTheDocument()
})

test('difficulty toggle updates the Solo link', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('radio', { name: 'hard' }))
  expect(screen.getByRole('link', { name: 'Solo' })).toHaveAttribute(
    'href',
    '/solo?d=hard',
  )
})

test('"With friends" starts a shareable same-seed game', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'With friends' }))
  expect(
    screen.getByRole('heading', { name: 'Play with a friend' }),
  ).toBeInTheDocument()
})

test('unknown route shows the not-found screen', () => {
  render(
    <MemoryRouter initialEntries={['/does-not-exist']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('heading', { name: 'Nothing here' }),
  ).toBeInTheDocument()
})
