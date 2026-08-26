import { useEffect, useReducer } from 'react'
import { formatDuration, msUntilReset } from '../game/daily.ts'

/** A live "14h 03m 22s" string counting down to the next 00:00 UTC daily reset. */
export function useTimeUntilReset(): string {
  const [, tick] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return formatDuration(msUntilReset())
}
