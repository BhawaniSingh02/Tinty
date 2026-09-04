/**
 * Generates placeholder PWA icons (192, 512, and a 180 Apple touch icon) into
 * public/icons/. These are PLACEHOLDERS: a diagonal Tinty-gradient square with a
 * white "T". Replace with a proper logo export when one exists — keep the same
 * filenames and sizes and nothing else needs to change.
 *
 *   node scripts/generate-pwa-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

// Tinty gradient stops (see public/favicon.svg).
const A = [0x6d, 0x78, 0xff]
const B = [0xff, 0x5d, 0xb1]
const lerp = (a, b, t) => Math.round(a + (b - a) * t)

function iconPixels(size, padded) {
  // padded = draw the glyph smaller, for maskable safe-area (Android masks ~10%).
  const buf = Buffer.alloc(size * size * 4)
  const inset = padded ? Math.round(size * 0.14) : 0
  const g = size - inset * 2
  // T geometry within the glyph box
  const barTop = inset + g * 0.24
  const barH = g * 0.15
  const stemW = g * 0.15
  const stemX0 = inset + g / 2 - stemW / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size)
      let r = lerp(A[0], B[0], t)
      let gr = lerp(A[1], B[1], t)
      let b = lerp(A[2], B[2], t)
      const onBar = y >= barTop && y < barTop + barH && x >= inset && x < inset + g
      const onStem =
        x >= stemX0 && x < stemX0 + stemW && y >= barTop && y < inset + g * 0.82
      if (onBar || onStem) {
        r = gr = b = 0xff
      }
      const i = (y * size + x) * 4
      buf[i] = r
      buf[i + 1] = gr
      buf[i + 2] = b
      buf[i + 3] = 0xff
    }
  }
  return buf
}

// --- minimal PNG encoder ---
const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const targets = [
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, false],
]
for (const [name, size, padded] of targets) {
  writeFileSync(join(OUT, name), encodePng(size, iconPixels(size, padded)))
  console.log('wrote', name)
}
