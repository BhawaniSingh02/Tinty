import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'

// Smoke test — proves the toolchain (Vitest + jsdom + Tailwind + router) works.
test('renders the home screen', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'tinty' })).toBeInTheDocument()
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
