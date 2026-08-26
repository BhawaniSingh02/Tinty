import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import {
  challengeMessage,
  challengeUrl,
  shareChallenge,
} from '../../game/share.ts'
import type { Difficulty } from '../../game/difficulty.ts'

type State = 'idle' | 'copied' | 'shared' | 'failed'

/** "Challenge a friend" — builds the same-seed link for this game and shares it. */
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
  const [state, setState] = useState<State>('idle')
  const [url, setUrl] = useState('')

  const onClick = async () => {
    const link = challengeUrl(seed, difficulty, score, breakdown)
    const result = await shareChallenge(challengeMessage(score, link))
    if (result === 'shared') setState('shared')
    else if (result === 'copied') setState('copied')
    else if (result === 'failed') {
      setUrl(link)
      setState('failed')
    }
    // 'dismissed' — leave the button as it was
  }

  const label =
    state === 'copied'
      ? '✓ Copied — send it to a friend'
      : state === 'shared'
        ? '✓ Shared'
        : 'Challenge a friend'

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClick}>{label}</Button>
      {state === 'failed' && (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-dim"
          aria-label="Challenge link"
        />
      )}
    </div>
  )
}
