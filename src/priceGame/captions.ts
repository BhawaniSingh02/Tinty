import { MAX_SCORE } from './scoring.ts'

function pick(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

/** A one-liner for a single round's points (0–10). */
export function roundCaption(points: number): string {
  if (points >= 9.5) return pick(['Nailed it.', 'Dead on.', 'You shop here.'])
  if (points >= 8) return pick(['So close.', 'Barely off.', 'Good eye.'])
  if (points >= 5) return pick(['In the ballpark.', 'Not bad.', 'Ish.'])
  if (points >= 2) return pick(['Way off.', 'Not quite.', 'Hmm.'])
  return pick(['Wrong universe.', 'Bold guess.', 'Oof.'])
}

/** A one-liner for the final score (0–50). */
export function scoreCaption(total: number): string {
  const pct = total / MAX_SCORE
  if (pct >= 0.9)
    return pick(['Are you a shopkeeper?', 'Suspiciously good.', 'Insider pricing.'])
  if (pct >= 0.7) return pick(['Sharp eyes.', "That's a real score.", 'Respectable.'])
  if (pct >= 0.5) return pick(['Middle of the pack.', "You'll live.", 'Room to grow.'])
  if (pct >= 0.3)
    return pick(['Rough out there.', 'The prices won this round.', 'Big spender energy.'])
  return pick(['This score needs a receipt.', 'Were your eyes open?', "We've all been there."])
}
