import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import Seo from '../components/Seo.tsx'

export default function About() {
  return (
    <Layout>
      <Seo
        path="/about"
        title="About Tinty — free online memory games"
        description="Tinty is a small arcade of quick memory and perception games — Color Match, Price Guess, and more. Free, no sign-up, made to share with friends."
      />
      <GameCard>
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-text">About</h1>
          </header>

          <p className="text-sm leading-relaxed text-text-dim">
            Tinty is a small arcade of quick memory and perception games. Each
            one takes under a minute: you look, you remember, you guess, you get
            a score. No accounts, no downloads, no fuss.
          </p>

          <p className="text-sm leading-relaxed text-text-dim">
            Right now there are two games. <span className="text-text">Color Match</span>{' '}
            shows you a color for a few seconds, then asks you to recreate it
            from memory. <span className="text-text">Price Check</span> tests how
            well you can eyeball what things cost. More modes are on the way.
          </p>

          <p className="text-sm leading-relaxed text-text-dim">
            It's in the same spirit as games like dialed.gg — small, fast,
            score-driven. Free and built to be shared: challenge a friend with a
            link, or take on the daily where everyone on Earth gets the same
            five rounds and one shot.
          </p>

          <Link to="/" className="text-sm text-accent">
            Back to tinty
          </Link>
        </div>
      </GameCard>
    </Layout>
  )
}
