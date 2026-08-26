import type { PointerEvent as ReactPointerEvent, KeyboardEvent } from 'react'
import { useRef } from 'react'

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

/**
 * One vertical slider strip for the HSB picker. Drag anywhere on it, or focus
 * and use arrow / page / home-end keys. Top = high value by default; `invert`
 * flips it (used for Hue so it reads red→…→red top to bottom).
 */
export default function SliderStrip({
  label,
  min,
  max,
  value,
  onChange,
  gradient,
  invert = false,
  valueText,
}: {
  label: string
  min: number
  max: number
  value: number
  onChange: (next: number) => void
  gradient: string
  invert?: boolean
  valueText?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const setFromClientY = (clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = clamp((clientY - rect.top) / rect.height, 0, 1)
    const frac = invert ? pct : 1 - pct
    onChange(Math.round(min + frac * (max - min)))
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientY(e.clientY)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return
    setFromClientY(e.clientY)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step =
      e.key === 'PageUp' || e.key === 'PageDown'
        ? 10
        : e.key === 'Home' || e.key === 'End'
          ? max - min
          : 1
    let next: number
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'PageUp':
        next = value + step
        break
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'PageDown':
        next = value - step
        break
      case 'Home':
        next = max
        break
      case 'End':
        next = min
        break
      default:
        return
    }
    e.preventDefault()
    onChange(clamp(next, min, max))
  }

  const filledFrac = (value - min) / (max - min)
  const knobTop = invert ? filledFrac * 100 : (1 - filledFrac) * 100

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
      className="relative h-full w-7 shrink-0 touch-none rounded-full outline-none ring-white/80 focus-visible:ring-2"
      style={{ background: gradient }}
    >
      <span
        className="pointer-events-none absolute left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/25 shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_1px_5px_rgba(0,0,0,0.5)]"
        style={{ top: `${knobTop}%` }}
      />
    </div>
  )
}
