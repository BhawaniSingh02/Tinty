import type { ReactNode } from 'react'

/**
 * The self-contained centred play area. Every game screen (reveal, picker,
 * round result, final score) renders inside this one card. Nothing outside may
 * overlap or crowd it (CLAUDE.md design rules).
 *
 * Fixed at `max-w-card` (30rem) and a 5:6 portrait ratio → a tall, prominent
 * card that stays the same size whether the side ad rails are shown, hidden, or
 * filled. `relative overflow-hidden` so screens can absolutely fill it — the
 * colour reveal covering the whole surface, the slider strips on the edge, etc.
 */
export default function GameCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'relative flex aspect-[5/6] w-full max-w-card flex-col overflow-hidden',
        'rounded-card border border-border bg-surface shadow-2xl shadow-black/30',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
