// One-off: strips the solid background color from public/logo.png (chroma-key
// off the corner pixel) and trims the transparent margins so the mark fills
// its box instead of floating small inside a big square. Run with:
//   node scripts/process-logo.mjs
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'public', 'logo.png')
const out = path.join(root, 'public', 'logo.png')

const png = PNG.sync.read(readFileSync(src))
const { width, height, data } = png

// Sample the background color from the top-left corner.
const bg = { r: data[0], g: data[1], b: data[2] }
const TOLERANCE = 28 // Euclidean-ish per-channel tolerance for anti-aliased edges

function isBg(r, g, b) {
  return (
    Math.abs(r - bg.r) <= TOLERANCE &&
    Math.abs(g - bg.g) <= TOLERANCE &&
    Math.abs(b - bg.b) <= TOLERANCE
  )
}

let minX = width
let minY = height
let maxX = -1
let maxY = -1

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (width * y + x) << 2
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (isBg(r, g, b)) {
      data[i + 3] = 0 // fully transparent
    } else {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

// A little breathing room around the trimmed content.
const pad = Math.round(Math.max(width, height) * 0.03)
minX = Math.max(0, minX - pad)
minY = Math.max(0, minY - pad)
maxX = Math.min(width - 1, maxX + pad)
maxY = Math.min(height - 1, maxY + pad)

const cropW = maxX - minX + 1
const cropH = maxY - minY + 1

const cropped = new PNG({ width: cropW, height: cropH })
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcI = (width * (y + minY) + (x + minX)) << 2
    const dstI = (cropW * y + x) << 2
    cropped.data[dstI] = data[srcI]
    cropped.data[dstI + 1] = data[srcI + 1]
    cropped.data[dstI + 2] = data[srcI + 2]
    cropped.data[dstI + 3] = data[srcI + 3]
  }
}

writeFileSync(out, PNG.sync.write(cropped))
console.log(`logo.png: ${width}x${height} -> trimmed ${cropW}x${cropH}, background color rgb(${bg.r},${bg.g},${bg.b}) removed`)
