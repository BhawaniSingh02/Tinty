/**
 * Dark/light theme toggle. Dark is the default (CLAUDE.md: "dark-mode
 * first"); the choice is remembered in localStorage and applied via a
 * `data-theme` attribute on <html> (see index.html for the no-flash inline
 * script that applies it before first paint, and index.css for the tokens).
 */

export type Theme = 'dark' | 'light'

const KEY = 'tinty.theme'

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark'
}

export function applyTheme(theme: Theme): void {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // private mode / quota — the choice just won't persist
  }
}
