import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'
import Seo from '../components/Seo.tsx'

export default function Contact() {
  return (
    <Layout>
      <Seo
        path="/contact"
        title="Contact Tinty — support & feedback"
        description="Get in touch with Tinty. Send bugs, ideas, or feedback about our free online memory and guessing games — one email, no form."
      />
      <GameCard>
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-text">Contact</h1>
          </header>

          <p className="text-sm leading-relaxed text-text-dim">
            Found a bug, have an idea, or just want to say hi? Send a note to{' '}
            <a href="mailto:bhonii.banna@gmail.com" className="text-accent">
              bhonii.banna@gmail.com
            </a>
            . Feedback on the games is always welcome.
          </p>

          <Link to="/" className="text-sm text-accent">
            Back to tinty
          </Link>
        </div>
      </GameCard>
    </Layout>
  )
}
