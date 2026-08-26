import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import {
  challengeLink,
  inviteMessage,
  shareChallenge,
} from '../../game/share.ts'
import type { ParsedChallenge } from '../../game/share.ts'
import { DIFFICULTY_CONFIG } from '../../game/difficulty.ts'
import { MAX_SCORE } from '../../game/scoring.ts'
import { isSupabaseConfigured } from '../../lib/supabase.ts'

/**
 * The screen before a challenge game:
 *  - a friend's played link (score present) → "beat it"
 *  - a fresh "play with friends" link → play live now, or share and play async
 */
export default function ChallengeIntro({
  challenge,
  onPlayLive,
  onPlayAsync,
}: {
  challenge: ParsedChallenge
  onPlayLive: () => void
  onPlayAsync: () => void
}) {
  const [shareState, setShareState] = useState<
    'idle' | 'shared' | 'copied' | 'failed'
  >('idle')

  const url = challengeLink(challenge.code, challenge.difficulty)
  const friendScore = challenge.challengerScore

  const share = async () => {
    const result = await shareChallenge(inviteMessage(url))
    if (result !== 'dismissed') setShareState(result)
  }

  const shareLabel =
    shareState === 'copied'
      ? '✓ Link copied'
      : shareState === 'shared'
        ? '✓ Shared'
        : 'Share invite link'

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        {DIFFICULTY_CONFIG[challenge.difficulty].label} · with friends
      </div>

      {friendScore !== null ? (
        <>
          <h1 className="mt-2 text-3xl font-bold">Beat your friend</h1>
          <p className="mt-3 text-sm text-text-dim">
            They played these exact five colors and scored
          </p>
          <div className="mt-3 text-5xl font-bold tabular-nums">
            {friendScore.toFixed(2)}
            <span className="ml-1 text-xl font-semibold text-text-dim">
              / {MAX_SCORE}
            </span>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-2 text-3xl font-bold">Play with a friend</h1>
          <p className="mt-3 max-w-sm text-sm text-text-dim">
            Play live together now, or send the link and compare scores after.
          </p>
        </>
      )}

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        {friendScore !== null ? (
          <Button onClick={onPlayAsync} className="w-full">
            Beat it
          </Button>
        ) : (
          <>
            {isSupabaseConfigured && (
              <Button onClick={onPlayLive} className="w-full">
                Play live together
              </Button>
            )}
            <Button variant="secondary" onClick={share} className="w-full">
              {shareLabel}
            </Button>
            {shareState === 'failed' && (
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Invite link"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-dim"
              />
            )}
            <Button variant="secondary" onClick={onPlayAsync} className="w-full">
              Just play now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
