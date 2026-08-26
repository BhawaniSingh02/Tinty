import { Link } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <header className="flex w-full shrink-0 justify-center px-4 pt-4 pb-2">
      <Link
        to="/"
        className="text-sm font-semibold lowercase tracking-tight text-text-dim transition-colors hover:text-text"
      >
        tinty
      </Link>
    </header>
  )
}
