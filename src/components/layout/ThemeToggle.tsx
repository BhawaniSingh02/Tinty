import { useState } from 'react'
import { applyTheme, currentTheme, type Theme } from '../../theme.ts'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M20.6 15.3A8.5 8.5 0 1 1 8.7 3.4a7 7 0 0 0 11.9 11.9Z" />
    </svg>
  )
}

/** Small icon button that flips between dark and light theme. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-text-dim transition-colors hover:text-text"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
