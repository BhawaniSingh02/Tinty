import {
  formatHsb,
  hsbToCss,
  hsbToRgb,
  rgbToHsb,
  rgbToLab,
  type Hsb,
} from './color.ts'

describe('hsbToRgb', () => {
  const cases: [Hsb, [number, number, number]][] = [
    [{ h: 0, s: 100, b: 100 }, [255, 0, 0]],
    [{ h: 120, s: 100, b: 100 }, [0, 255, 0]],
    [{ h: 240, s: 100, b: 100 }, [0, 0, 255]],
    [{ h: 60, s: 100, b: 100 }, [255, 255, 0]],
    [{ h: 180, s: 100, b: 100 }, [0, 255, 255]],
    [{ h: 300, s: 100, b: 100 }, [255, 0, 255]],
    [{ h: 0, s: 0, b: 100 }, [255, 255, 255]],
    [{ h: 0, s: 0, b: 0 }, [0, 0, 0]],
    [{ h: 210, s: 50, b: 80 }, [102, 153, 204]],
  ]

  test.each(cases)('%o → %o', (hsb, [r, g, b]) => {
    expect(hsbToRgb(hsb)).toEqual({ r, g, b })
  })

  test('wraps hue outside 0–360 and clamps s/b', () => {
    expect(hsbToRgb({ h: 360, s: 100, b: 100 })).toEqual({ r: 255, g: 0, b: 0 })
    expect(hsbToRgb({ h: -120, s: 100, b: 100 })).toEqual({ r: 0, g: 0, b: 255 })
    expect(hsbToRgb({ h: 0, s: 150, b: 150 })).toEqual({ r: 255, g: 0, b: 0 })
  })
})

describe('rgbToHsb', () => {
  test('round-trips through hsbToRgb (within 8-bit quantization)', () => {
    for (const hsb of [
      { h: 0, s: 100, b: 100 },
      { h: 210, s: 50, b: 80 },
      { h: 45, s: 30, b: 65 },
      { h: 300, s: 90, b: 20 },
    ]) {
      const back = rgbToHsb(hsbToRgb(hsb))
      expect(Math.abs(back.h - hsb.h)).toBeLessThan(2)
      expect(Math.abs(back.s - hsb.s)).toBeLessThan(2)
      expect(Math.abs(back.b - hsb.b)).toBeLessThan(2)
    }
  })

  test('grey has zero saturation and undefined-but-zero hue', () => {
    expect(rgbToHsb({ r: 128, g: 128, b: 128 })).toMatchObject({ h: 0, s: 0 })
  })
})

describe('rgbToLab', () => {
  test('reference colors (sRGB, D65)', () => {
    expect(rgbToLab({ r: 255, g: 255, b: 255 })).toMatchObject({
      l: expect.closeTo(100, 2),
      a: expect.closeTo(0, 2),
      b: expect.closeTo(0, 2),
    })
    expect(rgbToLab({ r: 0, g: 0, b: 0 })).toMatchObject({
      l: expect.closeTo(0, 2),
      a: expect.closeTo(0, 2),
      b: expect.closeTo(0, 2),
    })

    const red = rgbToLab({ r: 255, g: 0, b: 0 })
    expect(red.l).toBeCloseTo(53.24, 1)
    expect(red.a).toBeCloseTo(80.09, 1)
    expect(red.b).toBeCloseTo(67.2, 1)

    const blue = rgbToLab({ r: 0, g: 0, b: 255 })
    expect(blue.l).toBeCloseTo(32.3, 1)
    expect(blue.a).toBeCloseTo(79.19, 1)
    expect(blue.b).toBeCloseTo(-107.86, 1)
  })
})

describe('formatting helpers', () => {
  test('hsbToCss', () => {
    expect(hsbToCss({ h: 0, s: 100, b: 100 })).toBe('rgb(255 0 0)')
  })

  test('formatHsb rounds', () => {
    expect(formatHsb({ h: 137.6, s: 34.9, b: 74.2 })).toBe('H138 S35 B74')
  })
})
