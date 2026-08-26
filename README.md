# Tinty

Free browser mini-games — [tinty.fun](https://tinty.fun). First game: **Color Match**.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router 7
- Vitest + Testing Library (jsdom)
- oxlint

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | Type-check + production build         |
| `npm run preview`   | Serve the production build locally    |
| `npm test`          | Run the test suite once               |
| `npm run test:watch`| Run tests in watch mode               |
| `npm run lint`      | Lint with oxlint                      |
| `npm run typecheck` | Type-check without emitting           |

## Routes

| Path        | Screen                                    |
| ----------- | ----------------------------------------- |
| `/`         | Start screen — Solo / With friends / Daily |
| `/solo`     | Solo Color Match (5 rounds, /50)          |
| `/c/:code`  | Shared-seed challenge (same colors, head-to-head) |
| `/daily`    | Daily challenge (one shot, UTC reset)     |

See `CLAUDE.md` for the full project spec and build order.

## Supabase (optional)

The daily **leaderboard** and the **global play counter** need Supabase. Without
it the game plays fine — those two features just show an offline state.

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/0001_daily_and_counter.sql` in the SQL editor.
3. Copy `Settings → API` values into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

The client library is lazy-loaded, so it never touches the initial bundle when
unconfigured.

## Deploy

Vercel or Netlify. `vercel.json` includes the SPA rewrite so deep links
like `/c/abc123` resolve to the app. Set the two `VITE_SUPABASE_*` vars in the
host's environment settings.
