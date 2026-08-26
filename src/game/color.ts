/**
 * Color model + conversions for Color Match.
 *
 *   HSB  — what the sliders produce and what we show ("H138 S35 B74").
 *          h 0–360, s 0–100, b 0–100. (HSB is the same space as HSV.)
 *   RGB  — 0–255, for rendering swatches.
 *   Lab  — CIELAB (D65), the perceptual space we score in (see deltaE.ts).
 *
 * All functions are pure. Rounding happens only at RGB (a real pixel value) —
 * HSB and Lab stay as floats.
 */

export interface Hsb {
  h: number
  s: number
  b: number
}

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Lab {
  l: number
  a: number
  b: number
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const wrapHue = (h: number) => ((h % 360) + 360) % 360

/** HSB → RGB (0–255, rounded). */
export function hsbToRgb({ h, s, b }: Hsb): Rgb {
  const S = clamp(s, 0, 100) / 100
  const V = clamp(b, 0, 100) / 100
  const hp = wrapHue(h) / 60
  const c = V * S
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = V - c

  let r = 0
  let g = 0
  let bl = 0
  if (hp < 1) [r, g, bl] = [c, x, 0]
  else if (hp < 2) [r, g, bl] = [x, c, 0]
  else if (hp < 3) [r, g, bl] = [0, c, x]
  else if (hp < 4) [r, g, bl] = [0, x, c]
  else if (hp < 5) [r, g, bl] = [x, 0, c]
  else [r, g, bl] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255),
  }
}

/** RGB (0–255) → HSB. */
export function rgbToHsb({ r, g, b }: Rgb): Hsb {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6
    else if (max === G) h = (B - R) / d + 2
    else h = (R - G) / d + 4
    h = wrapHue(h * 60)
  }

  return {
    h,
    s: (max === 0 ? 0 : d / max) * 100,
    b: max * 100,
  }
}

// --- RGB → CIELAB (D65) --------------------------------------------------------

const D65 = { x: 0.95047, y: 1.0, z: 1.08883 }

const srgbToLinear = (c: number) => {
  const n = c / 255
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
}

const labF = (t: number) =>
  t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29

/** RGB (0–255) → CIELAB. */
export function rgbToLab({ r, g, b }: Rgb): Lab {
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)

  const x = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / D65.x
  const y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / D65.y
  const z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / D65.z

  const fx = labF(x)
  const fy = labF(y)
  const fz = labF(z)

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/** HSB → CIELAB (via RGB). */
export function hsbToLab(hsb: Hsb): Lab {
  return rgbToLab(hsbToRgb(hsb))
}

// --- CSS helpers -------------------------------------------------------------

export function rgbToCss({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}

/** CSS color string for an HSB value (CSS has no hsb(), so via RGB). */
export function hsbToCss(hsb: Hsb): string {
  return rgbToCss(hsbToRgb(hsb))
}

/** "H138 S35 B74" — how a color is shown on the round-result screen. */
export function formatHsb({ h, s, b }: Hsb): string {
  return `H${Math.round(h)} S${Math.round(s)} B${Math.round(b)}`
}

/**
 * Which text tone is readable on top of a given color — `'dark'` for text on a
 * light color, `'light'` for text on a dark one. Uses CIELAB L* (perceptual
 * lightness), not naive RGB average.
 */
export function contrastText(bg: Hsb): 'dark' | 'light' {
  return rgbToLab(hsbToRgb(bg)).l >= 60 ? 'dark' : 'light'
}
