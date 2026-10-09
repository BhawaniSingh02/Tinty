// Rerunnable: downloads every Picture Puzzle image listed in
// dataset/puzzle/images.json, square-crops it to 800×800, compresses it to
// WebP and writes it to its `local_image` path under public/ (plus a 200px
// thumbnail for the gallery). Never hotlinked at runtime — the game only ever
// loads the local copy.
//
//   node scripts/download-puzzle-images.mjs          (skips files that exist)
//   node scripts/download-puzzle-images.mjs --force  (re-download everything)
//
// Images come from Unsplash under the Unsplash License (free for commercial
// use, no permission needed). The Imgix CDN does the crop server-side
// (`fit=crop&crop=entropy` keeps the most detailed region), sharp re-encodes.
//
// sharp isn't a dependency of this project; we borrow the copy already
// installed in the sibling jaipurgamers project (same as
// optimize-price-images.mjs).
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const dataFile = path.join(root, 'dataset', 'puzzle', 'images.json')

const require = createRequire(import.meta.url)
let sharp
for (const p of ['sharp', path.resolve(root, '../jaipurgamers/node_modules/sharp')]) {
  try {
    sharp = require(p)
    break
  } catch {
    /* try next */
  }
}
if (!sharp) {
  console.error('Could not load sharp. Install it: npm i -D sharp')
  process.exit(1)
}

const SIZE = 800
const QUALITY = 74
const force = process.argv.includes('--force')

// Small copy for the gallery grid + results screen: <theme>/thumbs/<slug>.webp
// (mirrors `puzzleThumb()` in src/puzzleGame/images.ts).
const THUMB = 200
const thumbPath = (file) =>
  path.join(path.dirname(file), 'thumbs', path.basename(file))

async function writeThumb(file) {
  const out = thumbPath(file)
  mkdirSync(path.dirname(out), { recursive: true })
  await sharp(file).resize(THUMB, THUMB).webp({ quality: 70 }).toFile(out)
}

async function main() {
  const images = JSON.parse(readFileSync(dataFile, 'utf8'))
  let bytes = 0
  for (const img of images) {
    const out = path.join(publicDir, img.local_image)
    if (!force && existsSync(out)) {
      bytes += statSync(out).size
      if (!existsSync(thumbPath(out))) await writeThumb(out)
      continue
    }
    mkdirSync(path.dirname(out), { recursive: true })
    const url = `${img.image_url}?w=${SIZE}&h=${SIZE}&fit=crop&crop=entropy&q=90&fm=jpg`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${img.id}: HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const info = await sharp(buf)
      .resize(SIZE, SIZE, { fit: 'cover' })
      .webp({ quality: QUALITY })
      .toFile(out)
    bytes += info.size
    await writeThumb(out)
    console.log(`✓ ${img.local_image} (${Math.round(info.size / 1024)} KB)`)
  }
  console.log(`${images.length} images, ${(bytes / 1024 / 1024).toFixed(2)} MB total`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
