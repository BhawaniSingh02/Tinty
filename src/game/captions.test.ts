import { roundCaption, scoreCaption } from './captions.ts'

test('roundCaption gives a non-empty line across 0–10', () => {
  for (let p = 0; p <= 10; p += 0.5) {
    expect(roundCaption(p).length).toBeGreaterThan(0)
  }
})

test('scoreCaption gives a non-empty line across 0–50', () => {
  for (let t = 0; t <= 50; t += 2.5) {
    expect(scoreCaption(t).length).toBeGreaterThan(0)
  }
})

test('a perfect score never draws the same line as a terrible one', () => {
  const great = new Set(Array.from({ length: 60 }, () => scoreCaption(50)))
  const awful = new Set(Array.from({ length: 60 }, () => scoreCaption(0)))
  for (const line of great) expect(awful.has(line)).toBe(false)
})
