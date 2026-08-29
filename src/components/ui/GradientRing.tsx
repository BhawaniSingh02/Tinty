import type { ReactNode } from 'react'

/** Wraps a pill-shaped control in a slim rainbow ring — the one deliberate
 *  spot of color on an otherwise minimal screen (daily / vanity CTAs). */
export default function GradientRing({ children }: { children: ReactNode }) {
  return (
    <div className="tinty-rainbow-ring inline-flex rounded-full p-[1.5px]">
      <div className="rounded-full bg-surface">{children}</div>
    </div>
  )
}
