import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'color', match: (p: string) => !p.startsWith('/price') },
  { to: '/price', label: 'price', match: (p: string) => p.startsWith('/price') },
]

/** Slim site header: the tinty wordmark plus tabs for each arcade mode.
 *  New Phase 2 modes slot in here as sibling tabs (CLAUDE.md). */
export default function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="flex w-full shrink-0 flex-col items-center gap-2 px-4 pt-4 pb-2">
      <Link
        to="/"
        className="text-sm font-semibold lowercase tracking-tight text-text-dim transition-colors hover:text-text"
      >
        tinty
      </Link>

      <nav className="flex gap-1 rounded-full border border-border bg-surface p-1">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-semibold lowercase tracking-tight transition-colors',
                active
                  ? 'bg-accent text-white'
                  : 'text-text-dim hover:text-text',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
