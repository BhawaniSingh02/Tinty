import { hsbToCss, type Hsb } from '../../game/color.ts'

/** One round on the final screen: guess (top-left) vs original (bottom-right),
 *  split on the diagonal, with the round score. */
export default function DiagonalSwatch({
  guess,
  target,
  points,
}: {
  guess: Hsb
  target: Hsb
  points: number
}) {
  return (
    <div
      className="relative aspect-square flex-1 overflow-hidden rounded-md ring-1 ring-white/10"
      style={{
        background: `linear-gradient(135deg, ${hsbToCss(guess)} 0 calc(50% - 1px), rgba(0,0,0,0.3) calc(50% - 1px) calc(50% + 1px), ${hsbToCss(target)} calc(50% + 1px) 100%)`,
      }}
    >
      <span className="absolute inset-x-0 bottom-1 text-center text-[11px] font-bold tabular-nums text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
        {points.toFixed(1)}
      </span>
    </div>
  )
}
