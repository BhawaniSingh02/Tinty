import { useCallback, useEffect, useRef, useState } from 'react'
import { getDeviceId } from '../game/identity.ts'
import { todayDaily } from '../game/daily.ts'
import {
  fetchBoard,
  fetchMyStanding,
  subscribeToBoard,
  type BoardEntry,
  type MyStanding,
} from './api.ts'
import { dbBoard, type LeaderboardCategory } from './config.ts'

export interface LeaderboardState {
  /** `undefined` = loading · `null` = offline · `[]` = empty */
  entries: BoardEntry[] | null | undefined
  /** `undefined` = loading · `null` = this device has no row on this board */
  myStanding: MyStanding | null | undefined
  /** the resolved DB board string (useful for a direct submit) */
  board: string
  refetch: () => void
}

/**
 * Load a leaderboard category and keep it live. Daily categories resolve to
 * today's UTC board; a Supabase Realtime subscription refetches (debounced) on
 * any change to that board.
 */
export function useLeaderboard(
  category: LeaderboardCategory | undefined,
): LeaderboardState {
  const deviceId = getDeviceId()
  const board = category
    ? dbBoard(category, category.kind === 'daily' ? todayDaily().ymd : undefined)
    : ''

  const [state, setState] = useState<{
    board: string
    entries: BoardEntry[] | null | undefined
    myStanding: MyStanding | null | undefined
  }>({ board, entries: undefined, myStanding: undefined })

  // Reset to "loading" the moment the board changes (React's adjust-during-
  // render pattern — no effect needed).
  if (state.board !== board) {
    setState({ board, entries: undefined, myStanding: undefined })
  }

  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const load = useCallback(() => {
    if (!board) return
    void fetchBoard(board).then((entries) =>
      setState((s) => (s.board === board ? { ...s, entries } : s)),
    )
    void fetchMyStanding(board, deviceId).then((myStanding) =>
      setState((s) => (s.board === board ? { ...s, myStanding } : s)),
    )
  }, [board, deviceId])

  const refetch = useCallback(() => {
    clearTimeout(debounce.current)
    debounce.current = setTimeout(load, 250)
  }, [load])

  useEffect(() => {
    if (!board) return
    load()
    const unsub = subscribeToBoard(board, refetch)
    return () => {
      clearTimeout(debounce.current)
      unsub()
    }
  }, [board, load, refetch])

  return {
    entries: state.board === board ? state.entries : undefined,
    myStanding: state.board === board ? state.myStanding : undefined,
    board,
    refetch,
  }
}
