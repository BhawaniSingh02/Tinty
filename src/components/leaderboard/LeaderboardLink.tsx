import { ButtonLink } from '../ui/Button.tsx'
import type { LeaderboardCategory } from '../../leaderboards/config.ts'

/**
 * "View leaderboard" — deep-links straight to one board in **focused** mode
 * (`focus=1`): the leaderboard page opens on that board alone, no game selector
 * or mode tabs. The navbar link (plain `/leaderboard`) keeps the browsable view.
 */
export default function LeaderboardLink({
  category,
  label = 'View leaderboard',
  variant = 'secondary',
}: {
  category: LeaderboardCategory
  label?: string
  variant?: 'primary' | 'secondary'
}) {
  return (
    <ButtonLink
      to={`/leaderboard?g=${category.game}&b=${encodeURIComponent(category.key)}&focus=1`}
      variant={variant}
    >
      {label}
    </ButtonLink>
  )
}
