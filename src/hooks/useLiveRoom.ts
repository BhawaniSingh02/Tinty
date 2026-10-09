import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.ts'
import { randomSeed } from '../game/rng.ts'
import {
  dedupeById,
  electHost,
  mergeScore,
  roomChannel,
  roomSeed,
  type LiveMessage,
  type LivePlayer,
  type LiveProgress,
} from '../game/live.ts'

export type RoomStatus = 'connecting' | 'lobby' | 'playing' | 'error'

export interface LiveRoom {
  status: RoomStatus
  players: LivePlayer[]
  meId: string
  hostId: string | null
  isHost: boolean
  seed: number
  /** Bumps on every start / rematch — key the game component on it to remount. */
  gameNonce: number
  scores: Record<string, number[]>
  /** Latest progress per player id (only games that send it). */
  progress: Record<string, LiveProgress>
  start: () => void
  submitRound: (n: number, score: number) => void
  sendProgress: (p: LiveProgress) => void
  rematch: () => void
}

const newId = () => Math.random().toString(36).slice(2, 10)

/** Connect to a live room for a challenge code. `tag` updates presence when it
 *  changes. `namespace` separates games that share the code space. */
export function useLiveRoom(code: string, tag: string, namespace = ''): LiveRoom {
  const meId = useMemo(() => {
    try {
      const existing = sessionStorage.getItem('tinty.liveId')
      if (existing) return existing
      const id = newId()
      sessionStorage.setItem('tinty.liveId', id)
      return id
    } catch {
      return newId()
    }
  }, [])

  const [status, setStatus] = useState<RoomStatus>(
    isSupabaseConfigured ? 'connecting' : 'error',
  )
  const [players, setPlayers] = useState<LivePlayer[]>([])
  const [scores, setScores] = useState<Record<string, number[]>>({})
  const [progress, setProgress] = useState<Record<string, LiveProgress>>({})
  const [seed, setSeed] = useState(() => roomSeed(code))
  const [gameNonce, setGameNonce] = useState(0)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const [joinedAt] = useState(() => Date.now())
  const tagRef = useRef(tag)
  useEffect(() => {
    tagRef.current = tag
  })

  const send = useCallback((msg: LiveMessage) => {
    void channelRef.current?.send({ type: 'broadcast', event: 'm', payload: msg })
  }, [])

  const apply = useCallback((msg: LiveMessage) => {
    if (msg.t === 'start' || msg.t === 'rematch') {
      setSeed(msg.seed)
      setScores({})
      setProgress({})
      setGameNonce((n) => n + 1)
      setStatus('playing')
    } else if (msg.t === 'submit') {
      setScores((s) => mergeScore(s, msg.id, msg.n, msg.score))
    } else if (msg.t === 'progress') {
      const { id, correct, total, moves, seconds, done } = msg
      setProgress((p) => ({ ...p, [id]: { correct, total, moves, seconds, done } }))
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    let channel: RealtimeChannel | null = null

    void getSupabase()?.then((sb) => {
      if (cancelled) return
      channel = sb.channel(roomChannel(code, namespace), {
        config: { broadcast: { self: false }, presence: { key: meId } },
      })
      channelRef.current = channel

      channel
        .on('broadcast', { event: 'm' }, ({ payload }) =>
          apply(payload as LiveMessage),
        )
        .on('presence', { event: 'sync' }, () => {
          const state = channel?.presenceState() ?? {}
          const list = Object.values(state)
            .flat()
            .map((p) => {
              const raw = p as unknown as {
                id?: string
                tag?: string
                joinedAt?: number
              }
              return {
                id: String(raw.id ?? ''),
                tag: String(raw.tag ?? ''),
                joinedAt: Number(raw.joinedAt ?? 0),
              }
            })
            .filter((p) => p.id)
          setPlayers(dedupeById(list))
        })
        .subscribe((s) => {
          if (cancelled) return
          if (s === 'SUBSCRIBED') {
            void channel?.track({
              id: meId,
              tag: tagRef.current,
              joinedAt,
            })
            setStatus((prev) => (prev === 'playing' ? prev : 'lobby'))
          } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
            setStatus('error')
          }
        })
    })

    return () => {
      cancelled = true
      void channel?.unsubscribe()
      channelRef.current = null
    }
  }, [code, namespace, meId, apply, joinedAt])

  useEffect(() => {
    void channelRef.current?.track({
      id: meId,
      tag,
      joinedAt,
    })
  }, [tag, meId, joinedAt])

  const hostId = electHost(players)

  const start = useCallback(() => {
    const s = roomSeed(code)
    send({ t: 'start', seed: s })
    apply({ t: 'start', seed: s })
  }, [code, send, apply])

  const submitRound = useCallback(
    (n: number, score: number) => {
      send({ t: 'submit', id: meId, n, score })
      setScores((sc) => mergeScore(sc, meId, n, score))
    },
    [meId, send],
  )

  const sendProgress = useCallback(
    (p: LiveProgress) => {
      send({ t: 'progress', id: meId, ...p })
      setProgress((prev) => ({ ...prev, [meId]: p }))
    },
    [meId, send],
  )

  const rematch = useCallback(() => {
    const s = randomSeed()
    send({ t: 'rematch', seed: s })
    apply({ t: 'rematch', seed: s })
  }, [send, apply])

  return {
    status,
    players,
    meId,
    hostId,
    isHost: hostId === meId,
    seed,
    gameNonce,
    scores,
    progress,
    start,
    submitRound,
    sendProgress,
    rematch,
  }
}
