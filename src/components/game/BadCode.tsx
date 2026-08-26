import { ButtonLink } from '../ui/Button.tsx'

/** Shown for a `/c/` or `/live/` link whose code doesn't decode. */
export default function BadCode() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
      <h1 className="text-2xl font-bold">This link looks broken</h1>
      <p className="max-w-xs text-sm text-text-dim">
        The code isn&rsquo;t one we recognize. Want to just play a round instead?
      </p>
      <ButtonLink to="/solo">Play a game</ButtonLink>
    </div>
  )
}
