import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LockIcon } from './icons.tsx'
import {
  PUZZLE_IMAGES,
  PUZZLE_THEMES,
  imagesForTheme,
  puzzleThumb,
  type PuzzleImage,
} from '../../puzzleGame/images.ts'
import { loadPuzzleStats } from '../../puzzleGame/storage.ts'

/**
 * The collection: every image grouped into themed packs. Images you've solved
 * (in any mode) show in full colour; the rest are greyed out and locked. Tap a
 * solved image for its title + photo credit. Progress lives in localStorage
 * (see puzzleGame/storage.ts → `completed`).
 */
export default function PuzzleGallery() {
  const completed = useMemo(() => new Set(loadPuzzleStats().completed), [])
  const [open, setOpen] = useState<PuzzleImage | null>(null)
  const total = PUZZLE_IMAGES.filter((i) => completed.has(i.id)).length

  return (
    <div className="screen-in relative flex h-full flex-col">
      <div className="flex items-baseline justify-between gap-3 px-6 pb-3 pt-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-dim">picture puzzle</div>
          <h1 className="text-2xl font-bold lowercase tracking-tight">gallery</h1>
        </div>
        <span className="text-sm tabular-nums text-text-dim">
          <span className="font-semibold text-text">{total}</span> / {PUZZLE_IMAGES.length} solved
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {PUZZLE_THEMES.map((theme) => {
          const images = imagesForTheme(theme.id)
          const done = images.filter((i) => completed.has(i.id)).length
          return (
            <section key={theme.id} className="mt-3 first:mt-0">
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold">
                <span>
                  <span aria-hidden="true">{theme.emoji}</span> {theme.label}
                </span>
                <span className="text-xs font-medium tabular-nums text-text-dim">
                  {done}/{images.length}
                  {done === images.length && ' ✓'}
                </span>
              </h2>
              <ul className="grid grid-cols-5 gap-1.5">
                {images.map((img) => {
                  const unlocked = completed.has(img.id)
                  return (
                    <li key={img.id}>
                      {unlocked ? (
                        <button
                          type="button"
                          onClick={() => setOpen(img)}
                          className="block aspect-square w-full overflow-hidden rounded-lg ring-1 ring-border transition-transform hover:scale-[1.04]"
                          aria-label={img.title}
                        >
                          <img
                            src={puzzleThumb(img)}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </button>
                      ) : (
                        <div
                          className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border"
                          aria-label="Locked — solve it to unlock"
                          role="img"
                        >
                          <img
                            src={puzzleThumb(img)}
                            alt=""
                            loading="lazy"
                            className="size-full scale-110 object-cover opacity-25 blur-[3px] grayscale"
                          />
                          <span className="absolute inset-0 grid place-items-center text-text-dim">
                            <LockIcon />
                          </span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        <p className="mt-5 text-xs text-text-dim">
          Solve any puzzle — solo, daily, challenge or live — to add its picture.{' '}
          <Link to="/puzzle" className="text-accent hover:underline">
            Play
          </Link>
        </p>
      </div>

      {open && (
        <button
          type="button"
          onClick={() => setOpen(null)}
          aria-label="Close"
          className="screen-in absolute inset-0 z-10 flex flex-col bg-surface/95 p-6 text-left backdrop-blur"
        >
          <img
            src={open.local_image}
            alt={open.title}
            className="min-h-0 w-full flex-1 object-contain"
          />
          <span className="mt-3 block text-lg font-bold">{open.title}</span>
          <span className="block text-xs text-text-dim">
            Photo by {open.photographer} on Unsplash · tap to close
          </span>
        </button>
      )}
    </div>
  )
}
