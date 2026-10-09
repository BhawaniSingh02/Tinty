function pick(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

/** A one-liner for a finished puzzle's score (0–10). */
export function puzzleCaption(points: number): string {
  if (points >= 9.5) return pick(['Surgical.', 'Not a wasted tap.', 'Did you build it?'])
  if (points >= 8) return pick(['Clean solve.', 'Sharp eyes.', 'Smooth operator.'])
  if (points >= 6) return pick(['Solid work.', 'Got there in style.', 'Respectable.'])
  if (points >= 4) return pick(['Scenic route.', 'Every tile, eventually.', 'It counts.'])
  if (points >= 2) return pick(['A long walk home.', 'Persistence pays. A bit.', 'Brute force.'])
  return pick(['Solved. Technically.', 'The tiles fought back.', 'We’ve all been there.'])
}
