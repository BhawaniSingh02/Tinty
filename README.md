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

| Path        | Screen                                    | Built in |
| ----------- | ----------------------------------------- | -------- |
| `/`         | Start screen / mode select                | step 2   |
| `/solo`     | Solo Color Match (5 rounds, /50)          | step 4   |
| `/c/:code`  | Shared-seed lobby (challenge + live H2H)  | steps 6 & 8 |
| `/daily`    | Daily challenge (one shot, UTC reset)     | step 7   |

See `CLAUDE.md` for the full project spec and build order.

## Deploy

Vercel or Netlify. `vercel.json` includes the SPA rewrite so deep links
like `/c/abc123` resolve to the app.
