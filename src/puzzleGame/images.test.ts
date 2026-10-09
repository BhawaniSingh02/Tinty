import { PUZZLE_IMAGES, PUZZLE_THEMES, imagesForTheme, puzzleThumb } from './images.ts'

// Every WebP actually on disk under public/images/puzzle, as site paths.
const ON_DISK = new Set(
  Object.keys(import.meta.glob('/public/images/puzzle/**/*.webp')).map((p) =>
    p.replace(/^\/public/, ''),
  ),
)

test('about 50 images across the themed packs', () => {
  expect(PUZZLE_IMAGES.length).toBeGreaterThanOrEqual(45)
  for (const theme of PUZZLE_THEMES) expect(imagesForTheme(theme.id).length).toBeGreaterThanOrEqual(5)
  expect(new Set(PUZZLE_IMAGES.map((i) => i.id)).size).toBe(PUZZLE_IMAGES.length)
})

test('every image records source, credit and license, and is stored locally', () => {
  for (const img of PUZZLE_IMAGES) {
    expect(img.source_url).toMatch(/^https:\/\/(unsplash\.com|www\.pexels\.com)\//)
    expect(img.photographer.length).toBeGreaterThan(0)
    expect(img.license).toMatch(/Unsplash License|Pexels License/)
    expect(img.local_image).toMatch(new RegExp(`^/images/puzzle/${img.theme}/[a-z0-9-]+\\.webp$`))
    expect(ON_DISK.has(img.local_image)).toBe(true)
    expect(ON_DISK.has(puzzleThumb(img))).toBe(true)
  }
})
