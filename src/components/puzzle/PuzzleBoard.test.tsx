import { fireEvent, render, screen } from '@testing-library/react'
import PuzzleBoard from './PuzzleBoard.tsx'

const tile = (n: number) => screen.getByRole('gridcell', { name: new RegExp(`^Tile ${n},`) })
const press = (el: HTMLElement) => fireEvent.keyDown(el, { key: 'Enter' })

test('pick a tile, then another → onSwap with their slots', () => {
  const onSwap = vi.fn()
  // slot:  0  1  2  3   (piece 0 is already home)
  render(<PuzzleBoard size={2} src="/x.webp" board={[0, 3, 1, 2]} onSwap={onSwap} />)

  press(tile(4)) // piece 3, in slot 1
  expect(tile(4)).toHaveAttribute('aria-selected', 'true')
  press(tile(2)) // piece 1, in slot 2
  expect(onSwap).toHaveBeenCalledWith(1, 2)
  expect(tile(4)).toHaveAttribute('aria-selected', 'false')
})

test('tapping the selected tile again puts it down', () => {
  const onSwap = vi.fn()
  render(<PuzzleBoard size={2} src="/x.webp" board={[1, 0, 3, 2]} onSwap={onSwap} />)
  press(tile(2))
  press(tile(2))
  expect(tile(2)).toHaveAttribute('aria-selected', 'false')
  expect(onSwap).not.toHaveBeenCalled()
})

test('tiles in place are locked: they can’t be picked or swapped into', () => {
  const onSwap = vi.fn()
  render(<PuzzleBoard size={2} src="/x.webp" board={[0, 3, 1, 2]} onSwap={onSwap} />)
  expect(tile(1)).toHaveAttribute('data-correct', 'true')
  expect(tile(1)).toHaveAccessibleName(/in place/)

  press(tile(1)) // locked → ignored
  expect(tile(1)).toHaveAttribute('aria-selected', 'false')

  press(tile(4))
  press(tile(1)) // can't drop onto a locked tile
  expect(onSwap).not.toHaveBeenCalled()
  expect(tile(4)).toHaveAttribute('aria-selected', 'true')
})

test('disabled / solved boards ignore input', () => {
  const onSwap = vi.fn()
  const { rerender } = render(
    <PuzzleBoard size={2} src="/x.webp" board={[1, 0, 3, 2]} disabled onSwap={onSwap} />,
  )
  press(tile(1))
  press(tile(2))
  rerender(<PuzzleBoard size={2} src="/x.webp" board={[0, 1, 2, 3]} solved onSwap={onSwap} />)
  press(tile(1))
  expect(onSwap).not.toHaveBeenCalled()
})

test('each tile shows its own slice of the picture', () => {
  render(<PuzzleBoard size={3} src="/pic.webp" board={[8, 1, 2, 3, 4, 5, 6, 7, 0]} onSwap={vi.fn()} />)
  const inner = tile(9).firstElementChild as HTMLElement // piece 8 = bottom-right slice
  expect(inner.style.backgroundImage).toContain('/pic.webp')
  expect(inner.style.backgroundPosition).toBe('100% 100%')
  expect(inner.style.backgroundSize).toBe('300% 300%')
})
