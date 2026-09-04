/**
 * Price Guess has no leaderboard code of its own any more — the unified
 * leaderboard system in `src/leaderboards/` handles every game and mode. The
 * site-wide "games played, ever" counter is shared; re-exported here so the
 * Price Check components can keep importing it from their own namespace.
 */
export { fetchGlobalPlays, bumpGlobalPlays } from '../game/leaderboard.ts'
