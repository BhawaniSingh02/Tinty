import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import { challengeUrl, copyToClipboard } from '../../game/share.ts'
import type { Difficulty } from '../../game/difficulty.ts'

/** One tap to copy this game's challenge link. */
export default function ShareButton({
  seed,
  difficulty,
  score,
  breakdown,
}: {
  seed: number
  difficulty: Difficulty
  score: number
  breakdown?: number[]
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const url = challengeUrl(seed, difficulty, score, breakdown)

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="w-full"
        onClick={async () =>
          setState((await copyToClipboard(url)) ? 'copied' : 'failed')
        }
      >
        {state === 'copied'
          ? '✓ Link copied — send it to a friend'
          : 'Copy challenge link'}
      </Button>
      {state === 'failed' && (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Challenge link"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-dim"
        />
      )}
    </div>
  )
}
