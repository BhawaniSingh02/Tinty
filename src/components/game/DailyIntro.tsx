import { Button } from '../ui/Button.tsx'
import { useTimeUntilReset } from '../../hooks/useTimeUntilReset.ts'
import type { Daily } from '../../game/daily.ts'

/** The screen before the daily: framing, reset countdown, one warning that it's one shot. */
export default function DailyIntro({
  daily,
  onStart,
}: {
  daily: Daily
  onStart: () => void
}) {
  const reset = useTimeUntilReset()

  return (
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 text-xs uppercase tracking-widest text-text-dim">
          <span>{daily.ymd}</span>
          <span>resets in {reset}</span>
        </div>
        <h1 className="mt-2 text-4xl font-bold lowercase tracking-tight">
          daily
        </h1>
        <p className="mt-3 max-w-sm text-sm text-text-dim">
          Five colors. The same for everyone on Earth today. You get one shot —
          no replay.
        </p>
      </div>

      <Button className="self-start" onClick={onStart}>
        Play the daily
      </Button>
    </div>
  )
}
