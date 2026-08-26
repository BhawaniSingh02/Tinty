import { Link } from 'react-router-dom'
import Layout from './layout/Layout.tsx'
import GameCard from './layout/GameCard.tsx'

/** Temporary placeholder for routes whose real UI is built in a later step. */
export default function RouteStub({ title }: { title: string }) {
  return (
    <Layout>
      <GameCard>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-text-dim">
            {title}
          </p>
          <p className="text-text-dim">Coming soon — scaffold only.</p>
          <Link to="/" className="text-sm text-accent">
            Home
          </Link>
        </div>
      </GameCard>
    </Layout>
  )
}
