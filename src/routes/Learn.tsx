import { Link } from 'react-router-dom'
import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

type Entry = { to: string; title: string; blurb: string }

const GUIDES: Entry[] = [
  {
    to: '/learn/color-match',
    title: 'How to play Color Match',
    blurb:
      'What HSB means, how to use the three sliders, Easy vs Hard, how the perceptual scoring works, and tips to raise your score.',
  },
  {
    to: '/learn/price-guess',
    title: 'How to play Price Guess',
    blurb:
      'How the game works, why scoring is percentage-based, the product categories, and how to estimate prices you have never seen.',
  },
]

const ARTICLES: Entry[] = [
  {
    to: '/learn/remembering-colors',
    title: 'Why humans are bad at remembering colors',
    blurb:
      'The perception and memory science behind Color Match — why a color you saw clearly two seconds ago is so hard to reproduce.',
  },
  {
    to: '/learn/guessing-prices',
    title: 'The psychology of guessing prices',
    blurb:
      'Anchoring, reference prices, charm pricing and brand premiums — why price estimation is harder than it feels.',
  },
  {
    to: '/learn/color-perception',
    title: 'How color perception works',
    blurb:
      'From three types of cone in your eye to the color on the screen — a short, accurate tour of how you see color at all.',
  },
]

function Card({ to, title, blurb }: Entry) {
  return (
    <li>
      <Link
        to={to}
        className="block rounded-card border border-border bg-surface p-5 transition-colors hover:border-text-dim/40"
      >
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-dim">{blurb}</p>
      </Link>
    </li>
  )
}

export default function Learn() {
  return (
    <ArticlePage>
      <Seo
        path="/learn"
        title="Guides & articles — Tinty"
        description="How to play Color Match and Price Guess, plus short readable articles on color memory, color perception and the psychology of guessing prices."
      />
      <h1>Guides &amp; articles</h1>
      <p className="lede">
        How the games work, and some genuinely interesting background on the
        perception and psychology behind them.
      </p>

      <h2>How to play</h2>
      <ul className="card-list flex flex-col gap-3">
        {GUIDES.map((e) => (
          <Card key={e.to} {...e} />
        ))}
      </ul>

      <h2>Reading</h2>
      <ul className="card-list flex flex-col gap-3">
        {ARTICLES.map((e) => (
          <Card key={e.to} {...e} />
        ))}
      </ul>
    </ArticlePage>
  )
}
