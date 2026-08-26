import { contrastText, formatHsb, hsbToCss, type Hsb } from '../../game/color.ts'
import RoundCounter from './RoundCounter.tsx'
import SliderStrip from './SliderStrip.tsx'
import CircleButton from './CircleButton.tsx'
import { TargetIcon } from './icons.tsx'

const HUE_GRADIENT =
  'linear-gradient(to bottom, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))'

/**
 * Phase 2: recreate the color from memory. Three edge sliders (H/S/B); the rest
 * of the card fills live with the current pick. Reticle button submits.
 */
export default function HsbPicker({
  round,
  value,
  onChange,
  onSubmit,
}: {
  round: number
  value: Hsb
  onChange: (next: Hsb) => void
  onSubmit: () => void
}) {
  const set = (patch: Partial<Hsb>) => onChange({ ...value, ...patch })
  const tone = contrastText(value)

  return (
    <div
      className="screen-in absolute inset-0"
      style={{ background: hsbToCss(value) }}
    >
      <RoundCounter round={round} tone={tone} />

      <div className="absolute bottom-4 left-3 top-14 flex gap-1.5">
        <SliderStrip
          label="Hue"
          min={0}
          max={360}
          invert
          value={value.h}
          valueText={`${Math.round(value.h)} degrees`}
          onChange={(h) => set({ h })}
          gradient={HUE_GRADIENT}
        />
        <SliderStrip
          label="Saturation"
          min={0}
          max={100}
          value={value.s}
          onChange={(s) => set({ s })}
          gradient={`linear-gradient(to bottom, ${hsbToCss({ ...value, s: 100 })}, ${hsbToCss({ ...value, s: 0 })})`}
        />
        <SliderStrip
          label="Brightness"
          min={0}
          max={100}
          value={value.b}
          onChange={(b) => set({ b })}
          gradient={`linear-gradient(to bottom, ${hsbToCss({ ...value, b: 100 })}, ${hsbToCss({ ...value, b: 0 })})`}
        />
      </div>

      <div
        className={`pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-wide ${
          tone === 'dark' ? 'text-black/50' : 'text-white/60'
        }`}
      >
        {formatHsb(value)}
      </div>

      <CircleButton onClick={onSubmit} label="Submit color">
        <TargetIcon />
      </CircleButton>
    </div>
  )
}
