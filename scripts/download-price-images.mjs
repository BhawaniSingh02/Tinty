// One-off/rerunnable script: downloads every item's image_url from dataset/*.json
// into public/images/<category-slug>/<item-slug>.<ext>, and stamps each item with
// a "local_image" field pointing at the local path. Run with: node scripts/download-price-images.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const datasetDir = path.join(root, 'dataset')
const imagesDir = path.join(root, 'public', 'images')

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function extFromUrlOrContentType(url, contentType) {
  const m = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/)
  if (m && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tif', 'tiff'].includes(m[1].toLowerCase())) {
    return m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase()
  }
  if (contentType) {
    if (contentType.includes('jpeg')) return 'jpg'
    if (contentType.includes('png')) return 'png'
    if (contentType.includes('webp')) return 'webp'
    if (contentType.includes('gif')) return 'gif'
    if (contentType.includes('tiff')) return 'tif'
  }
  return 'jpg'
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Wikimedia (and some brand CDNs) rate-limit rapid-fire requests with 429s —
// space requests out and back off with retries rather than giving up at once.
const REQUEST_GAP_MS = 1500
const MAX_ATTEMPTS = 4

async function fetchOnce(url, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      headers: {
        'User-Agent':
          'TintyPriceCheckBot/1.0 (tinty.fun price-guessing game dataset; contact: bhawanisinghinda02@gmail.com)',
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function downloadOne(url, destBase, timeoutMs = 20000) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchOnce(url, timeoutMs)
      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get('retry-after'))
        const backoff = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 4000 * attempt
        await sleep(backoff)
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const contentType = res.headers.get('content-type') || ''
      const ext = extFromUrlOrContentType(url, contentType)
      const buf = Buffer.from(await res.arrayBuffer())
      const dest = `${destBase}.${ext}`
      writeFileSync(dest, buf)
      return dest
    } catch (err) {
      lastErr = err
      if (String(err).includes('AbortError')) await sleep(2000 * attempt)
    }
  }
  throw lastErr ?? new Error('HTTP 429 (rate limited after retries)')
}

function existingLocalFile(destBase) {
  for (const ext of ['jpg', 'png', 'webp', 'gif', 'tif']) {
    const p = `${destBase}.${ext}`
    if (existsSync(p)) return p
  }
  return null
}

async function main() {
  const files = readdirSync(datasetDir).filter((f) => f.endsWith('.json'))
  const summary = []

  for (const file of files) {
    const filePath = path.join(datasetDir, file)
    const items = JSON.parse(readFileSync(filePath, 'utf8'))

    for (const item of items) {
      const catSlug = slugify(item.category)
      const itemSlug = slugify(`${item.brand}-${item.name}`)
      const dir = path.join(imagesDir, catSlug)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      const destBase = path.join(dir, itemSlug)

      const existing = existingLocalFile(destBase)
      if (existing) {
        const relPath = '/' + path.relative(path.join(root, 'public'), existing).split(path.sep).join('/')
        item.local_image = relPath
        summary.push({ file, item: `${item.brand} ${item.name}`, status: 'skip (already downloaded)' })
        continue
      }

      try {
        const dest = await downloadOne(item.image_url, destBase)
        const relPath = '/' + path.relative(path.join(root, 'public'), dest).split(path.sep).join('/')
        item.local_image = relPath
        summary.push({ file, item: `${item.brand} ${item.name}`, status: 'ok', path: relPath })
      } catch (err) {
        summary.push({ file, item: `${item.brand} ${item.name}`, status: 'FAILED', error: String(err) })
      }

      // Write after every item so progress survives an interrupted run.
      writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n')
      await sleep(REQUEST_GAP_MS)
    }
  }

  const failed = summary.filter((s) => s.status === 'FAILED')
  console.log(`Downloaded ${summary.length - failed.length}/${summary.length} images.`)
  if (failed.length) {
    console.log('Failures:')
    for (const f of failed) console.log(`  - [${f.file}] ${f.item}: ${f.error}`)
  }
}

main()
