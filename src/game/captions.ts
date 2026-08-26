import { MAX_SCORE } from './scoring.ts'

/**
 * Snarky flavor text. dialed.gg leans on this hard — it's cheap and it's what
 * people screenshot. Deliberately not seeded: a re-roll on replay is fine.
 */

function pick(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

/** A one-liner for a single round's points (0–10). */
export function roundCaption(points: number): string {
  if (points >= 9.5) return pick(['Dead on.', 'Nailed it.', "Chef's kiss."])
  if (points >= 8) return pick(['So close.', 'Barely off.', 'Warm.'])
  if (points >= 5) return pick(['In the neighborhood.', 'Not bad.', 'Ish.'])
  if (points >= 2) return pick(['Cold.', 'Not quite.', 'Hmm.'])
  return pick(['Wrong direction.', 'Bold choice.', 'Oof.'])
}

/** A one-liner for the final score (0–50). */
export function scoreCaption(total: number): string {
  const pct = total / MAX_SCORE
  if (pct >= 0.9)
    return pick([
      'Are you a monitor?',
      'Suspiciously good.',
      'Save some for the rest of us.',
    ])
  if (pct >= 0.7)
    return pick(['Sharp eyes.', "That's a real score.", 'Respectable.'])
  if (pct >= 0.5)
    return pick(['Middle of the pack.', "You'll live.", 'Room to grow.'])
  if (pct >= 0.3)
    return pick([
      'Rough out there.',
      'The colors won this round.',
      'Try Easy? No judgment.',
    ])
  return pick([
    'This score microwaves salad.',
    'Were your eyes open?',
    "We've all been there. Sort of.",
  ])
}
