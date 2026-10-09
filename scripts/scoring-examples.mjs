/**
 * Prints example score outputs for every game's scoring curve so the curve
 * can be sanity-checked without launching the app.
 *
 *   node scripts/scoring-examples.mjs
 */
import { hsbToLab } from '../src/game/color.ts'
import { deltaE2000 } from '../src/game/deltaE.ts'
import { pointsForDeltaE, scoreRound } from '../src/game/scoring.ts'
import { pointsForError, scoreGuess } from '../src/priceGame/scoring.ts'
import { formatClock, scorePuzzle } from '../src/puzzleGame/scoring.ts'
import { minSwaps, shuffledBoard } from '../src/puzzleGame/board.ts'

const bar = (n, max = 10, width = 24) =>
  '█'.repeat(Math.round((n / max) * width)).padEnd(width, '·')

console.log('\n=== COLOR MATCH — ΔE00 (CIEDE2000) → points / 10 ===\n')
console.log('  ΔE00   points   ' + ' '.repeat(10) + 'curve')
for (const dE of [0, 0.5, 1, 2, 3, 5, 8, 10, 13, 16, 20, 25, 30, 40, 50]) {
  console.log(
    `  ${String(dE).padStart(4)}   ${pointsForDeltaE(dE).toFixed(2).padStart(6)}   ${bar(pointsForDeltaE(dE))}`,
  )
}

console.log('\n  Sample guesses (HSB target vs guess):\n')
const colorCases = [
  ['spot on', { h: 210, s: 60, b: 55 }, { h: 210, s: 60, b: 55 }],
  ['brightness a touch off', { h: 210, s: 60, b: 55 }, { h: 210, s: 60, b: 48 }],
  ['slightly muddy', { h: 30, s: 70, b: 80 }, { h: 24, s: 55, b: 74 }],
  ['right hue, undershot sat', { h: 145, s: 80, b: 65 }, { h: 145, s: 45, b: 65 }],
  ['hue way off but near-gray', { h: 33, s: 8, b: 70 }, { h: 200, s: 6, b: 72 }],
  ['hue way off, vivid', { h: 33, s: 85, b: 70 }, { h: 200, s: 85, b: 70 }],
  ['complementary, full sat', { h: 120, s: 90, b: 60 }, { h: 300, s: 90, b: 60 }],
]
for (const [label, target, guess] of colorCases) {
  const dE = deltaE2000(hsbToLab(target), hsbToLab(guess))
  console.log(
    `  ${label.padEnd(26)} ΔE00 ${dE.toFixed(1).padStart(5)}  →  ${scoreRound(target, guess).toFixed(2)} pts`,
  )
}

console.log('\n\n=== PRICE CHECK — % error → points / 10 ===\n')
console.log('  % off   points   ' + ' '.repeat(10) + 'curve')
for (const pct of [0, 1, 2, 3, 5, 8, 10, 15, 20, 25, 33, 40, 50, 60, 75, 100, 150]) {
  console.log(
    `  ${String(pct).padStart(4)}%   ${pointsForError(pct / 100).toFixed(2).padStart(6)}   ${bar(pointsForError(pct / 100))}`,
  )
}

console.log('\n  Sample guesses across price tiers:\n')
const priceCases = [
  ['low  · $12 lip balm', 12, 12],
  ['low  · $12 lip balm', 12, 13],
  ['low  · $12 lip balm', 12, 16],
  ['low  · $12 lip balm', 12, 25],
  ['mid  · $240 headphones', 240, 250],
  ['mid  · $240 headphones', 240, 300],
  ['mid  · $240 headphones', 240, 180],
  ['mid  · $240 headphones', 240, 480],
  ['high · $95,000 car', 95_000, 92_000],
  ['high · $95,000 car', 95_000, 110_000],
  ['high · $95,000 car', 95_000, 140_000],
  ['high · $95,000 car', 95_000, 250_000],
]
for (const [label, actual, guess] of priceCases) {
  const pct = (Math.abs(guess - actual) / actual) * 100
  console.log(
    `  ${label.padEnd(24)} guess ${String(guess).padStart(7)}  (${pct.toFixed(0).padStart(3)}% off)  →  ${scoreGuess(actual, guess).toFixed(2)} pts`,
  )
}

console.log('\n  Price Check curve history (% off → points):\n')
const stepped = (pct) =>
  pct <= 5 ? 10 : pct <= 10 ? 8 : pct <= 25 ? 5 : pct <= 50 ? 2 : 0
const prevExp = (pct) => {
  const r = 10 * Math.exp(-((pct / 100 / 0.32) ** 1.6))
  return r < 0.1 ? 0 : Math.round(r * 100) / 100
}
console.log('  % off   stepped   exp v1   exp v2 (now)')
for (const pct of [2, 5, 10, 15, 20, 25, 30, 33, 40, 50, 75, 95]) {
  console.log(
    `  ${String(pct).padStart(4)}%   ${stepped(pct).toFixed(2).padStart(7)}   ${prevExp(pct).toFixed(2).padStart(6)}   ${pointsForError(pct / 100).toFixed(2).padStart(6)}`,
  )
}

console.log('\n=== PICTURE PUZZLE — time × moves → points / 10 ===\n')
console.log('  "optimal" = fewest swaps that solve the board (avg over 500 shuffles).')
console.log('  few = optimal +15%   ·   some = +60%   ·   many = 2× optimal\n')
const PUZZLE_CASES = [
  ['easy', 3, [20, 45, 90]],
  ['medium', 4, [50, 110, 220]],
  ['hard', 5, [100, 210, 400]],
]
for (const [difficulty, size, [fast, mid, slow]] of PUZZLE_CASES) {
  const opts = Array.from({ length: 500 }, (_, i) => minSwaps(shuffledBoard(size, i + 1)))
  const optimal = Math.round(opts.reduce((a, b) => a + b, 0) / opts.length)
  const moves = [
    ['few', Math.round(optimal * 1.15)],
    ['some', Math.round(optimal * 1.6)],
    ['many', optimal * 2],
  ]
  console.log(`  ${difficulty.toUpperCase()} ${size}×${size}  (optimal ≈ ${optimal} swaps)`)
  console.log(
    '  ' + ''.padEnd(16) + moves.map(([l, m]) => `${l} (${m})`.padStart(12)).join(''),
  )
  for (const [label, seconds] of [['fast', fast], ['medium', mid], ['slow', slow]]) {
    const row = moves.map(([, m]) =>
      scorePuzzle({ difficulty, seconds, moves: m, optimal, peeks: 0 }).toFixed(2).padStart(12),
    )
    console.log(`  ${`${label} ${formatClock(seconds)}`.padEnd(16)}${row.join('')}`)
  }
  const base = scorePuzzle({ difficulty, seconds: mid, moves: Math.round(optimal * 1.15), optimal, peeks: 0 })
  const peeked = scorePuzzle({ difficulty, seconds: mid, moves: Math.round(optimal * 1.15), optimal, peeks: 1 })
  console.log(`  1 peek on medium/few: ${base.toFixed(2)} → ${peeked.toFixed(2)}\n`)
}
console.log()
