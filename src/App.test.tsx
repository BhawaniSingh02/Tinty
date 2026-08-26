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
  expect(
    screen.getByRole('link', { name: 'Play solo' }),
  ).toHaveAttribute('href', '/solo?d=easy')
})

test('difficulty toggle updates the Play solo link', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('radio', { name: 'hard' }))
  expect(screen.getByRole('link', { name: 'Play solo' })).toHaveAttribute(
    'href',
    '/solo?d=hard',
  )
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
