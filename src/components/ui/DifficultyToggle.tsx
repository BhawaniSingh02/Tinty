import { DIFFICULTIES } from '../../game/difficulty.ts'

/**
 * Pill radio group for picking a difficulty. Defaults to Color Match's
 * easy/hard; other games pass their own `options` (Picture Puzzle: three
 * grid sizes) and optional `labels`.
 */
export default function DifficultyToggle<T extends string>({
  value,
  onChange,
  options = DIFFICULTIES as unknown as readonly T[],
  labels,
}: {
  value: T
  onChange: (next: T) => void
  options?: readonly T[]
  labels?: Partial<Record<T, string>>
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      className="inline-flex rounded-full border border-border bg-surface-2 p-1"
    >
      {options.map((d) => {
        const active = d === value
        return (
          <button
            key={d}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(d)}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors',
              active
                ? 'bg-text text-bg'
                : 'text-text-dim hover:text-text',
            ].join(' ')}
          >
            {labels?.[d] ?? d}
          </button>
        )
      })}
    </div>
  )
}
