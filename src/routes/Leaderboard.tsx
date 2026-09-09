import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import Seo from '../components/Seo.tsx'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable.tsx'
import { useLeaderboard } from '../leaderboards/useLeaderboard.ts'
import { useTimeUntilReset } from '../hooks/useTimeUntilReset.ts'
import { getDeviceId } from '../game/identity.ts'
import {
  LEADERBOARD_GAMES,
  categoriesForGame,
  findCategory,
  gameLabel,
  type LeaderboardGameId,
} from '../leaderboards/config.ts'

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active ? 'bg-text text-bg' : 'text-text-dim hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * `/leaderboard` — two render modes off the same board component:
 *   - browsable (navbar link): game selector + mode tabs
 *   - focused (`?focus=1`, from a results screen): that one board only,
 *     no selector, no tabs
 * Both read the target board from `?g=` / `?b=`.
 */
export default function Leaderboard() {
  const [params, setParams] = useSearchParams()
  const focused = params.get('focus') === '1'

  const category = useMemo(() => {
    const fromKey = findCategory(params.get('b'))
    if (fromKey) return fromKey
    const game = (params.get('g') as LeaderboardGameId) || 'color'
    return categoriesForGame(game)[0] ?? categoriesForGame('color')[0]
  }, [params])

  const game = category.game
  const tabs = categoriesForGame(game)
  const board = useLeaderboard(category)
  const reset = useTimeUntilReset()
  const deviceId = getDeviceId()

  const go = (g: LeaderboardGameId, key: string) => {
    setParams({ g, b: key }, { replace: true })
  }

  return (
    <Layout>
      <Seo
        path={focused ? undefined : '/leaderboard'}
        noindex={focused}
        title={
          focused
            ? `${gameLabel(game)} ${category.label} leaderboard | Tinty`
            : 'Leaderboards — Color Match & Price Guess | Tinty'
        }
        description="All-time and daily leaderboards for Tinty's games. See the top 50 scores, where you rank, and how today's daily is going."
      />
      {/* Same fixed frame as the game card on Color Match / Price Guess — the
          content inside changes with the data state, the card never does. */}
      <GameCard className="p-5 text-left sm:p-6">
        {focused ? (
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-lg font-bold">
              {gameLabel(game)}
              <span className="ml-1.5 font-semibold text-text-dim">
                {category.label}
              </span>
            </h1>
            <Link
              to="/leaderboard"
              className="shrink-0 text-xs text-text-dim underline underline-offset-2 hover:text-text"
            >
              All boards
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold">Leaderboards</h1>

            <div className="mt-3 inline-flex self-start rounded-full border border-border bg-surface-2 p-1">
              {LEADERBOARD_GAMES.map((g) => (
                <Pill
                  key={g.game}
                  active={g.game === game}
                  onClick={() => go(g.game, categoriesForGame(g.game)[0].key)}
                >
                  {g.label}
                </Pill>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {tabs.map((t) => (
                <Pill
                  key={t.key}
                  active={t.key === category.key}
                  onClick={() => go(game, t.key)}
                >
                  {t.label}
                </Pill>
              ))}
            </div>
          </>
        )}

        {category.kind === 'daily' && (
          <p className="mt-2 text-xs text-text-dim">
            Resets in {reset} · today&rsquo;s board
          </p>
        )}

        <div className="mt-4 min-h-0 flex-1 overflow-hidden">
          <LeaderboardTable
            entries={board.entries}
            myStanding={board.myStanding}
            deviceId={deviceId}
          />
        </div>
      </GameCard>
    </Layout>
  )
}
