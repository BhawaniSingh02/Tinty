import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import Seo from '../components/Seo.tsx'

export default function NotFound() {
  return (
    <Layout>
      <Seo
        noindex
        title="Page not found | Tinty"
        description="That page doesn't exist. Head back to Tinty to play Color Match or Price Guess."
      />
      <GameCard>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-2xl font-bold">Nothing here</h1>
          <Link to="/" className="text-sm text-accent">
            Back to tinty
          </Link>
        </div>
      </GameCard>
    </Layout>
  )
}
