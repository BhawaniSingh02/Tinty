import type { Hsb } from './color.ts'
import { scoreRound, ROUNDS } from './scoring.ts'

export type Phase = 'reveal' | 'recall' | 'result' | 'final'

export interface RoundResult {
  target: Hsb
  guess: Hsb
  points: number
}

export interface GameState {
  phase: Phase
  /** 0-based index of the current round. */
  round: number
  /** Live picker value during `recall`; the submitted guess afterwards. */
  guess: Hsb
  /** One entry per completed round. */
  results: RoundResult[]
}

/** Neutral picker start — no hint toward the target (CLAUDE.md). */
export const NEUTRAL_GUESS: Hsb = { h: 180, s: 50, b: 50 }

export const initialState: GameState = {
  phase: 'reveal',
  round: 0,
  guess: NEUTRAL_GUESS,
  results: [],
}

export type GameAction =
  | { type: 'startRecall' }
  | { type: 'setGuess'; guess: Hsb }
  | { type: 'submit'; target: Hsb }
  | { type: 'next' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'startRecall':
      if (state.phase !== 'reveal') return state
      return { ...state, phase: 'recall', guess: NEUTRAL_GUESS }

    case 'setGuess':
      if (state.phase !== 'recall') return state
      return { ...state, guess: action.guess }

    case 'submit': {
      if (state.phase !== 'recall') return state
      const points = scoreRound(action.target, state.guess)
      return {
        ...state,
        phase: 'result',
        results: [
          ...state.results,
          { target: action.target, guess: state.guess, points },
        ],
      }
    }

    case 'next': {
      if (state.phase !== 'result') return state
      const nextRound = state.round + 1
      return nextRound >= ROUNDS
        ? { ...state, phase: 'final' }
        : { ...state, phase: 'reveal', round: nextRound }
    }

    default:
      return state
  }
}
