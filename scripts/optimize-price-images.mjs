// One-off/rerunnable: shrinks every downloaded price image to a web-sized WebP
// (many originals are 2–22 MB straight off Wikimedia) and repoints each item's
// `local_image` at the .webp. The huge originals stay on disk but are no longer
// referenced — delete public/images/**/*.{jpg,png,gif,tif} once this looks good.
//
//   node scripts/optimize-price-images.mjs
//
// sharp isn't a dependency of this project; we borrow the copy already installed
// in the sibling jaipurgamers project.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const datasetDir = path.join(root, 'dataset')

const require = createRequire(import.meta.url)
let sharp
for (const p of [
  'sharp',
  path.resolve(root, '../jaipurgamers/node_modules/sharp'),
]) {
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

const MAX_EDGE = 1100 // px — plenty for a ~460px card, crisp on retina
const QUALITY = 78

async function main() {
  const files = readdirSync(datasetDir).filter((f) => f.endsWith('.json'))
  let done = 0
  let bytesBefore = 0
  let bytesAfter = 0

  for (const file of files) {
    const filePath = path.join(datasetDir, file)
    const items = JSON.parse(readFileSync(filePath, 'utf8'))

    for (const item of items) {
      const src = item.local_image
      if (!src) continue
      const srcAbs = path.join(publicDir, src.replace(/^\//, ''))
      if (!existsSync(srcAbs)) {
        console.warn(`missing: ${src}`)
        continue
      }
      if (src.endsWith('.webp')) continue // already optimized on a prior run

      const outRel = src.replace(/\.[a-zA-Z0-9]+$/, '.webp')
      const outAbs = path.join(publicDir, outRel.replace(/^\//, ''))

      try {
        const input = readFileSync(srcAbs)
        const out = await sharp(input, { animated: false })
          .rotate()
          .resize(MAX_EDGE, MAX_EDGE, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: QUALITY, effort: 5 })
          .toBuffer()
        writeFileSync(outAbs, out)
        bytesBefore += input.length
        bytesAfter += out.length
        item.local_image = outRel
        done++
      } catch (err) {
        console.warn(`FAILED ${src}: ${err}`)
      }
    }

    writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n')
  }

  const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB'
  console.log(`Optimized ${done} images: ${mb(bytesBefore)} -> ${mb(bytesAfter)}`)
}

main()
