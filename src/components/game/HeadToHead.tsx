function Side({
  label,
  score,
  winning,
}: {
  label: string
  score: number
  winning: boolean
}) {
  return (
    <div>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wide ${
          winning ? 'text-accent' : 'text-text-dim'
        }`}
      >
        {label}
      </div>
      <div
        className={`text-4xl font-bold tabular-nums ${
          winning ? 'text-text' : 'text-text-dim'
        }`}
      >
        {score.toFixed(2)}
      </div>
    </div>
  )
}

/** Side-by-side result for a challenge game: your score vs the challenger's. */
export default function HeadToHead({ you, them }: { you: number; them: number }) {
  const diff = you - them
  const verdict =
    Math.abs(diff) < 0.5
      ? 'Photo finish.'
      : diff > 0
        ? `You win by ${diff.toFixed(2)}.`
        : `They got you by ${(-diff).toFixed(2)}.`

  return (
    <div className="mt-2">
      <div className="flex items-end gap-8">
        <Side label="You" score={you} winning={diff >= 0} />
        <Side label="Them" score={them} winning={diff <= 0} />
      </div>
      <p className="mt-2 text-sm text-text-dim">{verdict}</p>
    </div>
  )
}
