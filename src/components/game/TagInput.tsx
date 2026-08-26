import { sanitizeTag } from '../../game/player.ts'

/** 3-letter initials for the leaderboard. */
export default function TagInput({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(sanitizeTag(e.target.value))}
      placeholder="AAA"
      maxLength={3}
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      aria-label="Your initials"
      className="w-20 rounded-lg border border-border bg-surface-2 px-3 py-2 text-center text-lg font-bold uppercase tracking-[0.3em] outline-none placeholder:text-text-dim/40 focus-visible:border-text-dim"
    />
  )
}
