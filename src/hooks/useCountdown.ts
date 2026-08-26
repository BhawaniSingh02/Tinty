import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A once-only countdown for the reveal screen. Returns `remaining` seconds
 * (updated every frame for a smooth tick) and a `skip()` that ends it early.
 * `onComplete` fires exactly once — when the timer hits 0 or `skip()` is called.
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
    let raf = requestAnimationFrame(function tick(now) {
      const left = Math.max(0, seconds - (now - start) / 1000)
      setRemaining(left)
      if (left <= 0) {
        fire()
        return
      }
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [seconds, fire])

  return { remaining, skip: fire }
}
