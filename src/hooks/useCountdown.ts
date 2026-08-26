import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A once-only countdown for the reveal screen. Returns `remaining` seconds
 * (updated every frame for a smooth tick) and a `skip()` that ends it early.
 * `onComplete` fires exactly once — when the timer hits 0 or `skip()` is called.
 *
 * Completion is driven by `setTimeout` (fires even in a backgrounded tab); the
 * rAF loop only drives the visible tick and is allowed to stall when hidden.
 */
export function useCountdown(seconds: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const firedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  const fire = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    onCompleteRef.current()
  }, [])

  useEffect(() => {
    const start = performance.now()
    const timer = setTimeout(fire, seconds * 1000)
    let raf = requestAnimationFrame(function tick(now) {
      setRemaining(Math.max(0, seconds - (now - start) / 1000))
      raf = requestAnimationFrame(tick)
    })
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [seconds, fire])

  return { remaining, skip: fire }
}
