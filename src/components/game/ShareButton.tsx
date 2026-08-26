import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import { challengeUrl, copyToClipboard } from '../../game/share.ts'
import type { Difficulty } from '../../game/difficulty.ts'

/** The challenge link for this game — shown as plain text, one tap to copy. */
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
  const [copied, setCopied] = useState(false)
  const url = challengeUrl(seed, difficulty, score, breakdown)

  return (
    <div className="flex flex-col gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Challenge link"
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs text-text-dim"
      />
      <Button
        className="w-full"
        onClick={async () => setCopied(await copyToClipboard(url))}
      >
        {copied ? '✓ Link copied — send it to a friend' : 'Copy challenge link'}
      </Button>
    </div>
  )
}
