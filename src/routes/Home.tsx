import { Link } from 'react-router-dom'

// Placeholder — the real start screen (game card, mode select, ad slots)
// lands in build step 2.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-5xl font-bold lowercase tracking-tight">tinty</h1>
      <p className="text-text-dim">
        Free browser mini-games. First up: Color Match.
      </p>
      <nav className="flex flex-col gap-2 text-accent">
        <Link to="/solo">Solo</Link>
        <Link to="/daily">Daily</Link>
        <Link to="/c/demo">Challenge (demo code)</Link>
      </nav>
    </main>
  )
}
