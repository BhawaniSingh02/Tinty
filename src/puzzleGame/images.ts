import data from '../../dataset/puzzle/images.json'

/**
 * Picture Puzzle image library. The source of truth is
 * dataset/puzzle/images.json — one entry per image with its Unsplash source
 * URL, photographer credit and license (same idea as the price dataset).
 * `scripts/download-puzzle-images.mjs` turns each entry into a local 800×800
 * WebP at `local_image`; the game never hotlinks the source.
 */
export interface PuzzleImage {
  id: string
  theme: PuzzleThemeId
  title: string
  photographer: string
  photographer_url: string
  source_url: string
  image_url: string
  license: string
  license_url: string
  local_image: string
}

export type PuzzleThemeId = 'nature' | 'cities' | 'animals' | 'space' | 'food'

export interface PuzzleTheme {
  id: PuzzleThemeId
  label: string
  emoji: string
}

/** Gallery packs, in display order. */
export const PUZZLE_THEMES: readonly PuzzleTheme[] = [
  { id: 'nature', label: 'Nature', emoji: '🏔️' },
  { id: 'cities', label: 'Cities', emoji: '🏙️' },
  { id: 'animals', label: 'Animals', emoji: '🦊' },
  { id: 'space', label: 'Space', emoji: '🌌' },
  { id: 'food', label: 'Food', emoji: '🍓' },
]

export const PUZZLE_IMAGES: readonly PuzzleImage[] = data as PuzzleImage[]

export function imagesForTheme(theme: PuzzleThemeId): PuzzleImage[] {
  return PUZZLE_IMAGES.filter((img) => img.theme === theme)
}

export function findImage(id: string): PuzzleImage | undefined {
  return PUZZLE_IMAGES.find((img) => img.id === id)
}

/** The 200px gallery thumbnail written next to each image by the script. */
export function puzzleThumb(img: PuzzleImage): string {
  const i = img.local_image.lastIndexOf('/')
  return `${img.local_image.slice(0, i)}/thumbs${img.local_image.slice(i)}`
}
