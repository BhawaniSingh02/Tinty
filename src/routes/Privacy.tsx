import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout.tsx'
import GameCard from '../components/layout/GameCard.tsx'

/**
 * Plain-language privacy policy. Kept deliberately short — Tinty is a casual
 * game site with no accounts and no server-side profile of any player.
 *
 * Everything here reflects what the code actually does:
 *  - localStorage: solo/daily bests + streak (obfuscated key, see game/storage.ts),
 *    Price Check bests (priceGame/storage.ts), 3-letter tag (game/player.ts),
 *    theme choice (theme.ts); sessionStorage: a random live-room id (useLiveRoom.ts).
 *  - Vercel Analytics (<Analytics/> in App.tsx): anonymous pageviews only.
 *  - Supabase (lib/supabase.ts): daily leaderboard rows (tag + score) and a
 *    global play counter. Live rooms are Realtime broadcast only — nothing
 *    about a room or its players is stored.
 *  - AdSense: not live yet; listed because it's planned.
 */

const UPDATED = '30 August 2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-text-dim">
        {children}
      </div>
    </section>
  )
}

export default function Privacy() {
  return (
    <Layout>
      <GameCard>
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-text">Privacy</h1>
            <p className="text-xs text-text-dim/70">Last updated {UPDATED}</p>
          </header>

          <p className="text-sm leading-relaxed text-text-dim">
            Tinty is a free browser game. There are no accounts, and we don't
            want your personal information. This page explains the little bit of
            data the site does touch.
          </p>

          <Section title="What we store on your device">
            <p>
              Your browser keeps a few things locally so the game works between
              visits. This never leaves your device unless noted below:
            </p>
            <ul className="list-disc pl-5">
              <li>Your best scores, current streak, and a short history of recent games.</li>
              <li>The 3-letter tag you pick for leaderboards.</li>
              <li>Your light/dark theme choice.</li>
              <li>A random room ID during a live multiplayer session (cleared when you close the tab).</li>
            </ul>
            <p>
              Clearing your browser storage for this site erases all of it. No
              cookies are used for tracking or advertising today.
            </p>
          </Section>

          <Section title="What we collect">
            <ul className="list-disc pl-5">
              <li>
                <span className="text-text">Anonymous pageviews</span> via Vercel
                Analytics — which pages load and rough traffic numbers. No
                names, no cross-site tracking, no cookies.
              </li>
              <li>
                <span className="text-text">Daily leaderboard entries</span> — if
                you post a daily score, your 3-letter tag and that score are
                saved so the board can be shown. That's the only thing tied to
                you, and you chose the tag.
              </li>
              <li>
                <span className="text-text">A global play counter</span> — a
                single number that goes up by one each time a game finishes.
              </li>
            </ul>
          </Section>

          <Section title="Multiplayer">
            <p>
              Challenge and live games are fully anonymous. Room codes are random
              and the 5 colors are derived from the code itself. During a live
              match, players' tags and per-round scores are passed between
              browsers in real time but are not written to any database.
            </p>
          </Section>

          <Section title="What we don't collect">
            <ul className="list-disc pl-5">
              <li>No email, password, or account of any kind.</li>
              <li>No name, address, phone number, or location.</li>
              <li>No payment details — nothing on the site is for sale.</li>
            </ul>
          </Section>

          <Section title="Kids">
            <p>
              The site is fine for all ages and collects nothing that could
              identify a child.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If this policy changes, the date at the top changes with it.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email{' '}
              <a href="mailto:bhonii.banna@gmail.com" className="text-accent">
                bhonii.banna@gmail.com
              </a>
              .
            </p>
          </Section>

          <Link to="/" className="text-sm text-accent">
            Back to tinty
          </Link>
        </div>
      </GameCard>
    </Layout>
  )
}
