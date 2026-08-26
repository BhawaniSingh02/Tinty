import { DIFFICULTIES, type Difficulty } from '../../game/difficulty.ts'

export default function DifficultyToggle({
  value,
  onChange,
}: {
  value: Difficulty
  onChange: (next: Difficulty) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      className="inline-flex rounded-full border border-border bg-surface-2 p-1"
    >
      {DIFFICULTIES.map((d) => {
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
            {d}
          </button>
        )
      })}
    </div>
  )
}
