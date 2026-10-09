import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button.tsx'
import { copyToClipboard, puzzleChallengeLink } from '../../puzzleGame/share.ts'
import { gridLabel, type PuzzleDifficulty } from '../../puzzleGame/difficulty.ts'
import { isSupabaseConfigured } from '../../lib/supabase.ts'

/**
 * The two ways to play Picture Puzzle with friends:
 *  1. Host a live round — same puzzle at the same moment, see their progress
 *  2. Challenge link — send a link, they solve the same board whenever
 */
export default function PuzzleFriendsChooser({
  code,
  difficulty,
}: {
  code: string
  difficulty: PuzzleDifficulty
}) {
  const navigate = useNavigate()
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle')
  const url = puzzleChallengeLink(code, difficulty)

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        picture puzzle · with friends · {gridLabel(difficulty)}
      </div>
      <h1 className="mt-2 text-3xl font-bold lowercase tracking-tight">play with friends</h1>

      <div className="mt-6 flex flex-col gap-3">
        {isSupabaseConfigured && (
          <button
            type="button"
            onClick={() => navigate(`/puzzle/live/${code}?d=${difficulty}`)}
            className="rounded-xl border border-border bg-surface-2 p-4 text-left transition-colors hover:border-text-dim"
          >
            <div className="font-semibold">Host a live race</div>
            <p className="mt-1 text-xs text-text-dim">
              Same picture, same shuffle, same moment — watch your friend&rsquo;s
              tiles click into place while you solve yours.
            </p>
          </button>
        )}

        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-semibold">Challenge link</div>
          <p className="mt-1 text-xs text-text-dim">
            Send a link. Everyone solves the identical board whenever they want;
            results compared after.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () => setCopy((await copyToClipboard(url)) ? 'copied' : 'failed')}
            >
              {copy === 'copied' ? '✓ Copied' : 'Copy link'}
            </Button>
            <Button onClick={() => navigate(`/puzzle/c/${code}?d=${difficulty}`)}>Play it</Button>
          </div>
          {copy === 'failed' && (
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Challenge link"
              className="mt-2 w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] text-text-dim"
            />
          )}
        </div>
      </div>
    </div>
  )
}
