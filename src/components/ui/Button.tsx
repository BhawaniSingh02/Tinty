import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary'

const base =
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent/90',
  secondary: 'border border-border bg-surface-2 text-text hover:border-text-dim',
}

type CommonProps = {
  children: ReactNode
  variant?: Variant
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={[base, variants[variant], className].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  to,
  variant = 'primary',
  className = '',
}: CommonProps & { to: string }) {
  return (
    <Link
      to={to}
      className={[base, variants[variant], className].join(' ')}
    >
      {children}
    </Link>
  )
}
