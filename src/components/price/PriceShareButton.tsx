import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import { priceChallengeUrl, copyToClipboard } from '../../priceGame/share.ts'

/** One tap to copy this Price Check game's challenge link. */
export default function PriceShareButton({
  seed,
  score,
  breakdown,
}: {
  seed: number
  score: number
  breakdown?: number[]
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const url = priceChallengeUrl(seed, score, breakdown)

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
