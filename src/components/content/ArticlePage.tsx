import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../layout/SiteHeader.tsx'
import SiteFooter from '../layout/SiteFooter.tsx'

export type RelatedLink = { to: string; label: string }

/**
 * Long-form reading layout — the About page, the how-to-play guides and the
 * Learn articles. Unlike the game screens (a fixed 5:6 card), this is a wider,
 * natural-height column that scrolls, but keeps the same dark surface, border
 * and rounded-card styling so it still feels like part of Tinty.
 *
 * Prose styling lives in the `.article` block in index.css.
 */
export default function ArticlePage({
  children,
  related,
}: {
  children: ReactNode
  related?: RelatedLink[]
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5 sm:pt-8">
        <article className="article rounded-card border border-border bg-surface p-6 sm:p-10">
          {children}
        </article>

        {related && related.length > 0 && (
          <nav
            aria-label="Related pages"
            className="mt-5 rounded-card border border-border bg-surface/60 p-5"
          >
            <h2 className="mb-2 text-sm font-semibold text-text">Keep reading</h2>
            <ul className="flex flex-col gap-1.5">
              {related.map((r) => (
                <li key={r.to}>
                  <Link to={r.to} className="text-sm text-accent hover:underline">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link to="/" className="text-text-dim hover:text-text">
            Play Color Match
          </Link>
          <Link to="/price" className="text-text-dim hover:text-text">
            Play Price Guess
          </Link>
          <Link to="/learn" className="text-text-dim hover:text-text">
            All guides &amp; articles
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
