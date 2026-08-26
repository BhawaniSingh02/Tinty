import type { ReactNode } from 'react'

/** The white circular action button anchored bottom-right of the game card. */
export default function CircleButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute bottom-4 right-4 z-10 grid size-14 place-items-center rounded-full bg-white text-black shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  )
}
