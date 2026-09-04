import { useState } from 'react'
import { Button } from '../ui/Button.tsx'
import { NAME_MAX_LENGTH, sanitizeName } from '../../game/identity.ts'

/**
 * The display-name step shown when a personal best qualifies for a board.
 *
 *  - no saved name yet  → a labelled input + "Post to leaderboard"
 *  - saved name         → one-tap "Post as <name>", with a quiet "not you?"
 *                         toggle that reveals the input to change it
 */
export default function NamePrompt({
  savedName,
  busy,
  error,
  onSubmit,
}: {
  savedName: string
  busy: boolean
  error?: string | null
  onSubmit: (name: string) => void
}) {
  const [editing, setEditing] = useState(savedName.length === 0)
  const [value, setValue] = useState(savedName)
  const name = sanitizeName(value)

  const showInput = editing || savedName.length === 0

  return (
    <div className="flex flex-col gap-2">
      {showInput ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (name && !busy) onSubmit(name)
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            maxLength={NAME_MAX_LENGTH}
            autoCorrect="off"
            spellCheck={false}
            aria-label="Display name for the leaderboard"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-text-dim/40 focus-visible:border-text-dim"
          />
          <Button type="submit" disabled={!name || busy}>
            {busy ? 'Posting…' : 'Post to leaderboard'}
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => !busy && onSubmit(name)} disabled={busy}>
            {busy ? 'Posting…' : `Post as ${savedName}`}
          </Button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-text-dim underline underline-offset-2 hover:text-text"
          >
            not you?
          </button>
        </div>
      )}
      {error && <p className="text-xs text-[#e5736b]">{error}</p>}
    </div>
  )
}
