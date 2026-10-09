import { DIFFICULTIES } from '../game/difficulty.ts'
import { PUZZLE_DIFFICULTIES } from '../puzzleGame/difficulty.ts'

/**
 * The one place that says which leaderboards exist. Categories are *derived*
 * from each game's declared competitive modes — Color Match reads its two
 * difficulties straight from `game/difficulty.ts`, Price Guess has no split yet
 * so it declares a single "solo" mode. A future Price difficulty split is a
 * one-line edit here (add to `modes`) and the whole system — tabs, boards,
 * realtime channels, results-screen links — picks it up with no other change.
 *
 * Board strings (the DB `board` column, see supabase/migrations/0003):
 *   all-time : `${game}:${mode}`              e.g. "color:easy", "puzzle:hard"
 *   daily    : `${game}:daily:${ymd}`         e.g. "color:daily:2026-09-04"
 * ymd comes from the same UTC-day helpers the daily games already use
 * (`todayDaily()` / `todayPriceDaily()` / `todayPuzzleDaily()`), so the reset
 * boundary matches.
 */

export type LeaderboardGameId = 'color' | 'price' | 'puzzle'
export type LeaderboardKind = 'alltime' | 'daily'

export interface GameModeDef {
  /** stable id, used in the board string and category key */
  id: string
  /** tab label */
  label: string
}

export interface LeaderboardGameDef {
  game: LeaderboardGameId
  label: string
  /** one all-time board per competitive mode */
  modes: GameModeDef[]
  /** whether this game also has a daily board */
  daily: boolean
}

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

export const LEADERBOARD_GAMES: LeaderboardGameDef[] = [
  {
    game: 'color',
    label: 'Color Match',
    modes: DIFFICULTIES.map((d) => ({ id: d, label: capitalize(d) })),
    daily: true,
  },
  {
    game: 'price',
    label: 'Price Guess',
    // No difficulty split yet — a single all-time board. Add more entries here
    // (or map a future price-difficulty list) to grow the tabs automatically.
    modes: [{ id: 'solo', label: 'Solo' }],
    daily: true,
  },
  {
    game: 'puzzle',
    label: 'Picture Puzzle',
    // One board per grid size (3×3 / 4×4 / 5×5). Scores are out of 10.
    modes: PUZZLE_DIFFICULTIES.map((d) => ({ id: d, label: capitalize(d) })),
    daily: true,
  },
]

export interface LeaderboardCategory {
  /** stable UI id, e.g. "color:easy" | "color:daily" | "price:solo" */
  key: string
  game: LeaderboardGameId
  kind: LeaderboardKind
  label: string
  /** the all-time mode id this board tracks; absent for daily */
  mode?: string
}

export function categoriesForGame(game: LeaderboardGameId): LeaderboardCategory[] {
  const def = LEADERBOARD_GAMES.find((g) => g.game === game)
  if (!def) return []
  const cats: LeaderboardCategory[] = def.modes.map((m) => ({
    key: `${game}:${m.id}`,
    game,
    kind: 'alltime',
    label: m.label,
    mode: m.id,
  }))
  if (def.daily) {
    cats.push({ key: `${game}:daily`, game, kind: 'daily', label: 'Daily' })
  }
  return cats
}

export const ALL_CATEGORIES: LeaderboardCategory[] = LEADERBOARD_GAMES.flatMap(
  (g) => categoriesForGame(g.game),
)

export function findCategory(key: string | null | undefined): LeaderboardCategory | undefined {
  return ALL_CATEGORIES.find((c) => c.key === key)
}

export function gameLabel(game: LeaderboardGameId): string {
  return LEADERBOARD_GAMES.find((g) => g.game === game)?.label ?? game
}

/** The DB `board` string for a category. Daily categories need today's ymd. */
export function dbBoard(cat: LeaderboardCategory, ymd?: string): string {
  if (cat.kind === 'daily') {
    if (!ymd) throw new Error(`daily board "${cat.key}" needs a ymd`)
    return `${cat.game}:daily:${ymd}`
  }
  return `${cat.game}:${cat.mode}`
}
