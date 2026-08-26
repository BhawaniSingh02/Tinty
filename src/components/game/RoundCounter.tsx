import { ROUNDS } from '../../game/scoring.ts'

/** "1 / 5" in the top-left of the card. Tone is set by the caller from the
 *  color behind it so it stays readable. */
export default function RoundCounter({
  round,
  tone,
  total = ROUNDS,
}: {
  round: number
  tone: 'dark' | 'light'
  total?: number
}) {
  return (
    <div
      className={`absolute left-4 top-4 z-10 text-sm font-semibold tabular-nums ${
        tone === 'dark' ? 'text-black/70' : 'text-white/85'
      }`}
    >
      {round + 1} / {total}
    </div>
  )
}
