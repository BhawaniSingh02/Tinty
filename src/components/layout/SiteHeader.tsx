import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.tsx'

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H4a2 2 0 0 0 0 4h2M18 6h2a2 2 0 0 1 0 4h-2M9 20h6M12 14v6" />
    </svg>
  )
}

const TABS = [
  { to: '/', label: 'color', match: (p: string) => !p.startsWith('/price') },
  { to: '/price', label: 'price', match: (p: string) => p.startsWith('/price') },
]

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={[
        'rounded-full border px-4 py-1.5 text-sm font-semibold lowercase tracking-tight transition-all',
        active
          ? 'border-transparent bg-text text-bg shadow-[0_1px_2px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.35)]'
          : 'border-border bg-surface text-text-dim hover:border-text-dim/40 hover:text-text',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

/** Slim site header: color — tinty — price, grouped together and centered
 *  on the page, with a small theme toggle tucked in the corner. New Phase 2
 *  modes slot in as siblings of color/price (CLAUDE.md). */
export default function SiteHeader() {
  const { pathname } = useLocation()
  const [color, price] = TABS

  return (
    <header className="relative flex w-full shrink-0 items-center justify-center px-4 py-2.5 after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-full after:max-w-card after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-border)_90%,var(--color-text)),transparent)]">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
        <NavLink to={color.to} label={color.label} active={color.match(pathname)} />
        <Link to="/" className="block px-3 transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="tinty" className="site-logo h-6 w-auto sm:h-7" />
        </Link>
        <NavLink to={price.to} label={price.label} active={price.match(pathname)} />
      </div>

      <Link
        to="/leaderboard"
        aria-label="Leaderboards"
        className={[
          'absolute left-4 top-4 flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-2 transition-colors hover:text-text',
          pathname === '/leaderboard' ? 'text-text' : 'text-text-dim',
        ].join(' ')}
      >
        <TrophyIcon />
        <span className="hidden pr-0.5 text-xs font-semibold sm:inline">
          Leaderboard
        </span>
      </Link>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
