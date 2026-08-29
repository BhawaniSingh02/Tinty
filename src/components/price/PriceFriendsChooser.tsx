import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button.tsx'
import { priceChallengeLink, copyToClipboard } from '../../priceGame/share.ts'
import { isSupabaseConfigured } from '../../lib/supabase.ts'

/**
 * The two ways to play Price Check with friends:
 *  1. Host a live round — everyone in a room, items revealed together
 *  2. Challenge link — send a link, everyone plays whenever, scores compared
 */
export default function PriceFriendsChooser({ code }: { code: string }) {
  const navigate = useNavigate()
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle')
  const url = priceChallengeLink(code)

  return (
    <div className="screen-in flex h-full flex-col p-7">
      <div className="text-xs uppercase tracking-widest text-text-dim">
        price check · with friends
      </div>
      <h1 className="mt-2 text-3xl font-bold lowercase tracking-tight">
        play with friends
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {isSupabaseConfigured && (
          <button
            type="button"
            onClick={() => navigate(`/price/live/${code}`)}
            className="rounded-xl border border-border bg-surface-2 p-4 text-left transition-colors hover:border-text-dim"
          >
            <div className="font-semibold">Host a live round</div>
            <p className="mt-1 text-xs text-text-dim">
              Play together in real time — everyone guesses the same items and
              scores tick in as you go.
            </p>
          </button>
        )}

        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-semibold">Challenge link</div>
          <p className="mt-1 text-xs text-text-dim">
            Send a link. Everyone guesses the same five items whenever they
            want; scores compared after.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () =>
                setCopy((await copyToClipboard(url)) ? 'copied' : 'failed')
              }
            >
              {copy === 'copied' ? '✓ Copied' : 'Copy link'}
            </Button>
            <Button onClick={() => navigate(`/price/c/${code}`)}>Play it</Button>
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
