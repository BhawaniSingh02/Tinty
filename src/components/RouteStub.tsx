import { Link } from 'react-router-dom'

/** Temporary placeholder for routes whose real UI is built in a later step. */
export default function RouteStub({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm uppercase tracking-widest text-text-dim">{title}</p>
      <p className="text-text-dim">Coming soon — scaffold only.</p>
      <Link to="/" className="text-accent">
        Home
      </Link>
    </main>
  )
}
