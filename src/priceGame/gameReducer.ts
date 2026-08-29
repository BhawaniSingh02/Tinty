import type { PriceItem } from './types.ts'
import { scoreGuess, ROUNDS } from './scoring.ts'

export type Phase = 'question' | 'result' | 'final'

export interface PriceRoundResult {
  item: PriceItem
  guess: number
  points: number
}

export interface PriceGameState {
  phase: Phase
  /** 0-based index of the current round. */
  round: number
  /** Live input during `question`. */
  guess: number | null
  results: PriceRoundResult[]
}

export const initialPriceState: PriceGameState = {
  phase: 'question',
  round: 0,
  guess: null,
  results: [],
}

export type PriceGameAction =
  | { type: 'setGuess'; guess: number | null }
  | { type: 'submit'; item: PriceItem }
  | { type: 'next' }

export function priceGameReducer(
  state: PriceGameState,
  action: PriceGameAction,
): PriceGameState {
  switch (action.type) {
    case 'setGuess':
      if (state.phase !== 'question') return state
      return { ...state, guess: action.guess }

    case 'submit': {
      if (state.phase !== 'question' || state.guess === null) return state
      const points = scoreGuess(action.item.price, state.guess)
      return {
        ...state,
        phase: 'result',
        results: [
          ...state.results,
          { item: action.item, guess: state.guess, points },
        ],
      }
    }

    case 'next': {
      if (state.phase !== 'result') return state
      const nextRound = state.round + 1
      return nextRound >= ROUNDS
        ? { ...state, phase: 'final' }
        : { ...state, phase: 'question', round: nextRound, guess: null }
    }

    default:
      return state
  }
}
