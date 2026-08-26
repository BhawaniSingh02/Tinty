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
  const hasFriendScore = challenge.challengerScore !== null

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
    <div className="screen-in flex h-full flex-col justify-between p-7">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-dim">
          {DIFFICULTY_CONFIG[challenge.difficulty].label} · with friends
        </div>

        {hasFriendScore ? (
          <>
            <h1 className="mt-2 text-3xl font-bold">Beat your friend</h1>
            <p className="mt-3 max-w-sm text-sm text-text-dim">
              They scored{' '}
              <span className="font-semibold tabular-nums text-text">
                {challenge.challengerScore?.toFixed(2)}
              </span>{' '}
              / {MAX_SCORE} on these exact five colors.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-3xl font-bold">Play with a friend</h1>
            <p className="mt-3 max-w-sm text-sm text-text-dim">
              Play live together now, or send the link and compare scores after.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col items-start gap-3">
        {hasFriendScore ? (
          <Button onClick={onPlayAsync}>Beat it</Button>
        ) : (
          <>
            {isSupabaseConfigured && (
              <Button onClick={onPlayLive}>Play live together</Button>
            )}
            <Button variant="secondary" onClick={share}>
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
            <Button variant="secondary" onClick={onPlayAsync}>
              Just play now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
