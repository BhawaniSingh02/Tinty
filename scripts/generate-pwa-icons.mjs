/**
 * Generates the favicon + PWA icon set into public/.
 *
 * The icon mark is NOT redrawn — it is the exact glyph cropped straight out of
 * public/logo.png (the same file the navbar renders). The pinwheel is a
 * transparent cut-out in a solid disc, so we recolour the disc to white
 * (exactly what the navbar's dark-mode CSS filter does) and let the flat
 * background show through the cut-out. Result: a white disc with a brand-blue
 * compass-pointer, centred on a lighter shade of the brand blue.
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * Outputs:
 *   public/favicon.svg
 *   public/icons/favicon-16.png, favicon-32.png
 *   public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
 *   public/icons/apple-touch-icon.png            (180, for iOS home screen)
 *
 * Note: the mark in logo.png is only ~53px, so the large icons upscale the real
 * asset (a little soft). Swap logo.png for a higher-res master to sharpen them.
 */
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUB = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const OUT = join(PUB, 'icons')
mkdirSync(OUT, { recursive: true })

const lerp = (a, b, t) => a + (b - a) * t
const hex = (v) => Math.round(v).toString(16).padStart(2, '0')

// ---------------------------------------------------------------------------
// crop the mark out of logo.png and sample its brand colour
// ---------------------------------------------------------------------------
const logo = PNG.sync.read(readFileSync(join(PUB, 'logo.png')))

function cropMark() {
  const { width: W, height: H, data } = logo
  const alphaAt = (x, y) => data[((W * y + x) << 2) + 3]

  let x0 = W
  let x1 = -1
  let y0 = H
  let y1 = -1
  let sawGap = false
  for (let x = 0; x < W; x++) {
    let cy0 = H
    let cy1 = -1
    for (let y = 0; y < H; y++) {
      if (alphaAt(x, y) > 16) {
        if (y < cy0) cy0 = y
        if (y > cy1) cy1 = y
      }
    }
    const colUsed = cy1 >= 0
    if (x1 >= 0 && !colUsed) {
      sawGap = true
      continue
    }
    if (sawGap && colUsed) break // reached the "T" — stop before absorbing it
    if (colUsed) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (cy0 < y0) y0 = cy0
      if (cy1 > y1) y1 = cy1
    }
  }

  // Pad the crop a little past the content bbox on every side, so the mark
  // keeps a transparent margin and nothing (halo, AA) is clipped asymmetrically.
  const contentW = x1 - x0 + 1
  const contentH = y1 - y0 + 1
  const side = Math.max(contentW, contentH) + 6
  const sx = Math.round((x0 + x1 + 1) / 2 - side / 2)
  const sy = Math.round((y0 + y1 + 1) / 2 - side / 2)

  const mark = new PNG({ width: side, height: side })
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const gx = sx + x
      const gy = sy + y
      const di = (side * y + x) << 2
      if (gx < 0 || gy < 0 || gx >= logo.width || gy >= logo.height) {
        mark.data[di + 3] = 0
        continue
      }
      const si = (logo.width * gy + gx) << 2
      mark.data[di] = logo.data[si]
      mark.data[di + 1] = logo.data[si + 1]
      mark.data[di + 2] = logo.data[si + 2]
      mark.data[di + 3] = logo.data[si + 3]
    }
  }

  // keep only the largest connected blob (drops detached chroma-key specks)
  const label = new Int32Array(side * side).fill(-1)
  let best = -1
  let bestSize = 0
  for (let start = 0; start < side * side; start++) {
    if (label[start] !== -1 || mark.data[(start << 2) + 3] <= 16) continue
    let size = 0
    const stack = [start]
    label[start] = start
    while (stack.length) {
      const k = stack.pop()
      size++
      const x = k % side
      const y = (k / side) | 0
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= side || ny >= side) continue
        const nk = ny * side + nx
        if (label[nk] === -1 && mark.data[(nk << 2) + 3] > 16) {
          label[nk] = start
          stack.push(nk)
        }
      }
    }
    if (size > bestSize) {
      bestSize = size
      best = start
    }
  }
  for (let k = 0; k < side * side; k++) {
    if (label[k] !== best) mark.data[(k << 2) + 3] = 0
  }

  // Recolour the disc to white (the pinwheel stays a transparent cut-out).
  // Same effect as the navbar's dark-mode `filter: brightness(0) invert(1)`.
  for (let k = 0; k < side * side; k++) {
    const i = k << 2
    mark.data[i] = 255
    mark.data[i + 1] = 255
    mark.data[i + 2] = 255
  }

  return mark
}

/** Bilinear-upscale an RGBA PNG to `to`×`to` so downstream sampling is smooth. */
function upscale(src, to) {
  const { width: n, data } = src
  const out = new PNG({ width: to, height: to })
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      const fx = (x / (to - 1)) * (n - 1)
      const fy = (y / (to - 1)) * (n - 1)
      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const x1 = Math.min(x0 + 1, n - 1)
      const y1 = Math.min(y0 + 1, n - 1)
      const tx = fx - x0
      const ty = fy - y0
      const di = (to * y + x) << 2
      for (let c = 0; c < 4; c++) {
        const pm = (px, py) => {
          const i = (n * py + px) << 2
          const a = data[i + 3] / 255
          return c === 3 ? data[i + 3] : data[i + c] * a
        }
        const top = lerp(pm(x0, y0), pm(x1, y0), tx)
        const bot = lerp(pm(x0, y1), pm(x1, y1), tx)
        out.data[di + c] = lerp(top, bot, ty)
      }
      const a = out.data[di + 3]
      if (a > 0) {
        const s = 255 / a
        out.data[di] *= s
        out.data[di + 1] *= s
        out.data[di + 2] *= s
      }
    }
  }
  return out
}

/** Dominant (modal) fully-opaque blue of the disc — the brand colour. */
function brandColor() {
  const { width: W, data } = logo
  const hist = new Map()
  for (let y = 32; y < 85; y++) {
    for (let x = 12; x < 65; x++) {
      const i = (W * y + x) << 2
      if (data[i + 3] > 250 && data[i + 2] > 150 && data[i + 2] - data[i] > 80) {
        const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
        hist.set(key, (hist.get(key) || 0) + 1)
      }
    }
  }
  let bestKey = 0x0d16e9
  let bestN = 0
  for (const [k, n] of hist) {
    if (n > bestN) {
      bestN = n
      bestKey = k
    }
  }
  return [(bestKey >> 16) & 255, (bestKey >> 8) & 255, bestKey & 255]
}

/** Light separable box blur on the alpha channel (2 passes ≈ gaussian). */
function blurAlpha(png, radius) {
  const { width: w, height: h, data } = png
  for (let pass = 0; pass < 2; pass++) {
    for (const horiz of [true, false]) {
      const src = Float32Array.from({ length: w * h }, (_, k) => data[(k << 2) + 3])
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let sum = 0
          let cnt = 0
          for (let d = -radius; d <= radius; d++) {
            const xx = horiz ? x + d : x
            const yy = horiz ? y : y + d
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
            sum += src[yy * w + xx]
            cnt++
          }
          data[((y * w + x) << 2) + 3] = Math.round(sum / cnt)
        }
      }
    }
  }
}

/** Tight bounding box of everything with alpha above `thresh`. */
function alphaBBox(png, thresh = 12) {
  const { width: w, height: h, data } = png
  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[((y * w + x) << 2) + 3] > thresh) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return {
    x0,
    y0,
    x1,
    y1,
    cx: (x0 + x1 + 1) / 2, // exact centre of the bbox, in pixels
    cy: (y0 + y1 + 1) / 2,
    extent: Math.max(x1 - x0 + 1, y1 - y0 + 1),
  }
}

// Crop the real glyph, then work at a smoothed intermediate resolution so the
// ~53px source doesn't upscale into visible stair-steps.
const MARK = upscale(cropMark(), 240)
blurAlpha(MARK, 2)
// The mark's true bounding box after all processing — every icon centres THIS
// on the exact canvas centre, so padding is equal on all four sides.
const MB = alphaBBox(MARK)
const BRAND = brandColor()
const BRAND_HEX = `#${hex(BRAND[0])}${hex(BRAND[1])}${hex(BRAND[2])}`

// Background: the brand blue lifted toward white so it reads as a lighter shade
// of the same colour (same hue, less dark).
const BG_MIX = 0.42
const BG = BRAND.map((c) => c + (255 - c) * BG_MIX)
const BG_HEX = `#${hex(BG[0])}${hex(BG[1])}${hex(BG[2])}`
console.log('brand', BRAND_HEX, '-> background', BG_HEX)

/**
 * How wide the mark's bounding box should be, in tile pixels. The maskable
 * icon gets a smaller mark so it clears Android's corner crop / safe circle.
 */
function markBoxFor(size, maskable) {
  const frac = maskable ? 0.55 : size <= 16 ? 0.68 : size <= 32 ? 0.7 : 0.72
  return size * frac
}

// premultiplied bilinear sample of the mark at pixel coords (fx, fy) in MARK space
function sampleMarkPx(fx, fy) {
  const { width: n, data } = MARK
  if (fx < 0 || fy < 0 || fx > n - 1 || fy > n - 1) return [0, 0, 0, 0]
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(x0 + 1, n - 1)
  const y1 = Math.min(y0 + 1, n - 1)
  const tx = fx - x0
  const ty = fy - y0
  const pm = (x, y, c) => {
    const i = (n * y + x) << 2
    const a = data[i + 3] / 255
    return c === 3 ? data[i + 3] : data[i + c] * a
  }
  const ch = []
  for (let c = 0; c < 4; c++) {
    const top = lerp(pm(x0, y0, c), pm(x1, y0, c), tx)
    const bot = lerp(pm(x0, y1, c), pm(x1, y1, c), tx)
    ch.push(lerp(top, bot, ty))
  }
  const a = ch[3]
  if (a <= 0) return [0, 0, 0, 0]
  const s = 255 / a
  return [ch[0] * s, ch[1] * s, ch[2] * s, a]
}

function renderPng(size, { maskable = false } = {}) {
  const png = new PNG({ width: size, height: size })
  const box = markBoxFor(size, maskable)
  // MARK-pixels -> tile-pixels, and the mapping that puts MB's centre on the
  // exact tile centre (size/2, size/2).
  const scale = box / MB.extent
  const cX = size / 2
  const cY = size / 2
  const SS = 3

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let R = 0
      let G = 0
      let B = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS
          const py = y + (sy + 0.5) / SS
          let r = BG[0]
          let g = BG[1]
          let b = BG[2]
          const mfx = MB.cx + (px - cX) / scale
          const mfy = MB.cy + (py - cY) / scale
          const [mr, mg, mb, ma] = sampleMarkPx(mfx, mfy)
          const a = ma / 255
          r = mr * a + r * (1 - a)
          g = mg * a + g * (1 - a)
          b = mb * a + b * (1 - a)
          R += r
          G += g
          B += b
        }
      }
      const n = SS * SS
      const i = (size * y + x) << 2
      png.data[i] = Math.round(R / n)
      png.data[i + 1] = Math.round(G / n)
      png.data[i + 2] = Math.round(B / n)
      png.data[i + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

// SVG favicon: solid background + the embedded mark, MB centred on the tile
function faviconSvg() {
  const S = 64
  const box = markBoxFor(S, false)
  const scale = box / MB.extent
  const imgW = MARK.width * scale
  const imgX = S / 2 - MB.cx * scale
  const imgY = S / 2 - MB.cy * scale
  const markB64 = PNG.sync.write(MARK).toString('base64')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" rx="10" fill="${BG_HEX}"/>
  <image x="${imgX.toFixed(3)}" y="${imgY.toFixed(3)}" width="${imgW.toFixed(3)}" height="${imgW.toFixed(3)}"
    image-rendering="optimizeQuality"
    href="data:image/png;base64,${markB64}"/>
</svg>
`
}

writeFileSync(join(PUB, 'favicon.svg'), faviconSvg())
console.log('wrote favicon.svg')

const targets = [
  ['favicon-16.png', 16, {}],
  ['favicon-32.png', 32, {}],
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, {}],
]
for (const [name, size, opts] of targets) {
  writeFileSync(join(OUT, name), renderPng(size, opts))
  console.log('wrote', name)
}
