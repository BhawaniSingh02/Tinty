import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

/**
 * The swap board. `board[slot] = piece`; piece `i` belongs in slot `i`.
 *
 *   - Tap a tile, then another → they swap (works with touch, mouse, pen).
 *   - Desktop mouse: drag a tile onto another to swap them.
 *   - Keyboard: Tab to a tile, Enter/Space to pick it, again on a target.
 *
 * Tiles already in the right place glow and lock — they can't be picked or
 * swapped out, so a correct tile can never be undone by a stray tap. On touch,
 * a finger that slides more than a few px (a scroll attempt) cancels the tap,
 * so there are no accidental swaps.
 *
 * Every piece is absolutely positioned and moved with a transform, so swaps
 * animate. When `solved`, the gaps and rounded corners collapse to zero and
 * the picture reads as one clean image.
 */
export default function PuzzleBoard({
  size,
  src,
  board,
  solved = false,
  disabled = false,
  onSwap,
}: {
  size: number
  src: string
  board: readonly number[]
  solved?: boolean
  disabled?: boolean
  onSwap: (a: number, b: number) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [drag, setDrag] = useState<{ slot: number; dx: number; dy: number; over: number | null } | null>(
    null,
  )
  const boardRef = useRef<HTMLDivElement>(null)
  const press = useRef<{
    slot: number
    x: number
    y: number
    pointerType: string
    moved: boolean
  } | null>(null)

  const slotOfPiece = new Array<number>(board.length)
  board.forEach((piece, slot) => (slotOfPiece[piece] = slot))
  const locked = (slot: number) => board[slot] === slot

  const tap = (slot: number) => {
    if (disabled || solved) return
    if (locked(slot)) return
    if (selected === null) {
      setSelected(slot)
    } else if (selected === slot) {
      setSelected(null)
    } else {
      onSwap(selected, slot)
      setSelected(null)
    }
  }

  const slotAt = (clientX: number, clientY: number): number | null => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const col = Math.floor(((clientX - rect.left) / rect.width) * size)
    const row = Math.floor(((clientY - rect.top) / rect.height) * size)
    if (col < 0 || row < 0 || col >= size || row >= size) return null
    return row * size + col
  }

  const onPointerDown = (e: PointerEvent, slot: number) => {
    if (disabled || solved || e.button !== 0) return
    press.current = { slot, x: e.clientX, y: e.clientY, pointerType: e.pointerType, moved: false }
    if (e.pointerType === 'mouse' && !locked(slot)) {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const p = press.current
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (!p.moved && Math.hypot(dx, dy) > 6) p.moved = true
    // Drag-and-drop is a desktop (mouse) affordance only. On touch a slide is
    // a scroll attempt and just cancels the tap.
    if (p.moved && p.pointerType === 'mouse' && !locked(p.slot)) {
      const over = slotAt(e.clientX, e.clientY)
      setDrag({ slot: p.slot, dx, dy, over: over !== null && !locked(over) ? over : null })
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    const p = press.current
    press.current = null
    if (!p) return
    if (drag) {
      const target = drag.over
      setDrag(null)
      if (target !== null && target !== p.slot) {
        onSwap(p.slot, target)
        setSelected(null)
      }
      return
    }
    if (!p.moved) {
      // Fire on the tile the pointer was released over (normally the same one).
      tap(slotAt(e.clientX, e.clientY) ?? p.slot)
    }
  }

  const onPointerCancel = () => {
    press.current = null
    setDrag(null)
  }

  const pct = 100 / size
  const gap = solved ? 0 : size >= 5 ? 2 : 3

  return (
    <div
      ref={boardRef}
      className="relative size-full touch-manipulation select-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role="grid"
      aria-label={`Picture puzzle, ${size} by ${size}`}
    >
      {board.map((_, piece) => {
        const slot = slotOfPiece[piece]
        const row = Math.floor(slot / size)
        const col = slot % size
        const homeRow = Math.floor(piece / size)
        const homeCol = piece % size
        const isCorrect = slot === piece
        const isSelected = selected === slot
        const isDragged = drag?.slot === slot
        const isDropTarget = drag !== null && drag.over === slot && drag.slot !== slot

        const style: CSSProperties = {
          width: `${pct}%`,
          height: `${pct}%`,
          padding: gap,
          transform: isDragged
            ? `translate(calc(${col * 100}% + ${drag.dx}px), calc(${row * 100}% + ${drag.dy}px))`
            : `translate(${col * 100}%, ${row * 100}%)`,
          zIndex: isDragged ? 30 : isSelected ? 20 : 1,
          transition: isDragged
            ? 'none'
            : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), padding 400ms ease',
        }

        const imgStyle: CSSProperties = {
          backgroundImage: `url(${src})`,
          backgroundSize: `${size * 100}% ${size * 100}%`,
          backgroundPosition: `${(homeCol / (size - 1)) * 100}% ${(homeRow / (size - 1)) * 100}%`,
        }

        return (
          <div
            key={piece}
            role="gridcell"
            tabIndex={disabled || solved ? -1 : 0}
            aria-label={`Tile ${piece + 1}, row ${row + 1} column ${col + 1}${
              isCorrect ? ', in place' : ''
            }${isSelected ? ', selected' : ''}`}
            aria-selected={isSelected}
            data-slot={slot}
            data-correct={isCorrect || undefined}
            onPointerDown={(e) => onPointerDown(e, slot)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                tap(slot)
              }
            }}
            className="absolute left-0 top-0 outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-accent"
            style={style}
          >
            <div
              className={[
                'puzzle-tile relative size-full overflow-hidden bg-surface-2',
                solved ? 'rounded-none' : 'rounded-[6px]',
                isCorrect && !solved ? 'puzzle-tile-locked' : '',
                isSelected ? 'puzzle-tile-selected' : '',
                isDropTarget ? 'puzzle-tile-target' : '',
                isDragged ? 'puzzle-tile-dragging' : '',
                !isCorrect && !disabled && !solved ? 'cursor-pointer' : '',
              ].join(' ')}
              style={imgStyle}
            />
          </div>
        )
      })}
    </div>
  )
}
