import { MAX_SCORE } from '../../game/scoring.ts'

export interface Side {
  label: string
  total: number
  /** Per-round points, if known — enables the round-by-round breakdown. */
  breakdown?: number[]
}

function ScoreBar({ value, lead }: { value: number; lead: boolean }) {
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={`h-full rounded-full ${lead ? 'bg-accent' : 'bg-text-dim'}`}
        style={{ width: `${Math.min(100, (value / MAX_SCORE) * 100)}%` }}
      />
    </div>
  )
}

function Column({
  label,
  total,
  lead,
}: {
  label: string
  total: number
  lead: boolean
}) {
  return (
    <div>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wide ${
          lead ? 'text-accent' : 'text-text-dim'
        }`}
      >
        {label}
      </div>
      <div
        className={`text-4xl font-bold tabular-nums ${
          lead ? 'text-text' : 'text-text-dim'
        }`}
      >
        {total.toFixed(2)}
      </div>
      <ScoreBar value={total} lead={lead} />
    </div>
  )
}

/** Two players' scores side by side, with a headline and optional round detail. */
export default function HeadToHead({ you, them }: { you: Side; them: Side }) {
  const diff = you.total - them.total
  const tie = Math.abs(diff) < 0.05
  const youLead = diff > 0

  const headline = tie ? 'Dead heat' : youLead ? 'You win' : `${them.label} wins`
  const margin = tie ? null : `by ${Math.abs(diff).toFixed(2)}`

  const rounds =
    you.breakdown && them.breakdown
      ? you.breakdown.map((_, i) => ({
          n: i + 1,
          you: you.breakdown?.[i] ?? 0,
          them: them.breakdown?.[i] ?? 0,
        }))
      : null

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {headline}
        {margin && (
          <span className="ml-2 text-lg font-semibold text-text-dim">
            {margin}
          </span>
        )}
      </h1>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <Column label={you.label} total={you.total} lead={youLead || tie} />
        <Column label={them.label} total={them.total} lead={!youLead || tie} />
      </div>

      {rounds && (
        <div className="mt-5 flex flex-col gap-1 text-sm tabular-nums">
          <div className="flex text-[10px] font-semibold uppercase tracking-wide text-text-dim">
            <span className="w-6" />
            <span className="flex-1 text-right">{you.label}</span>
            <span className="flex-1 text-right">{them.label}</span>
          </div>
          {rounds.map((r) => (
            <div key={r.n} className="flex text-text-dim">
              <span className="w-6">{r.n}</span>
              <span
                className={`flex-1 text-right ${
                  r.you >= r.them ? 'text-text' : ''
                }`}
              >
                {r.you.toFixed(1)}
              </span>
              <span
                className={`flex-1 text-right ${
                  r.them >= r.you ? 'text-text' : ''
                }`}
              >
                {r.them.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
