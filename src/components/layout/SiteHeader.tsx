import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.tsx'

const TABS = [
  { to: '/', label: 'color', match: (p: string) => !p.startsWith('/price') },
  { to: '/price', label: 'price', match: (p: string) => p.startsWith('/price') },
]

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={[
        'rounded-full px-4 py-1.5 text-sm font-semibold lowercase tracking-tight transition-all',
        active
          ? 'bg-accent text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_4px_16px_-4px_var(--color-accent)]'
          : 'text-text-dim hover:text-text',
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
    <header className="relative flex w-full shrink-0 items-center justify-center px-4 py-2.5">
      <div className="flex items-center gap-6 sm:gap-8">
        <NavLink to={color.to} label={color.label} active={color.match(pathname)} />
        <Link to="/" className="block transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="tinty" className="site-logo h-6 w-auto sm:h-7" />
        </Link>
        <NavLink to={price.to} label={price.label} active={price.match(pathname)} />
      </div>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
