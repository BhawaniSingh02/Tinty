import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function About() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/color-match', label: 'How to play Color Match' },
        { to: '/learn/price-guess', label: 'How to play Price Guess' },
        { to: '/learn', label: 'Guides & articles' },
      ]}
    >
      <Seo
        path="/about"
        title="About Tinty — free browser memory & guessing games"
        description="What Tinty is, the idea behind it, and how Color Match and Price Guess work. A small, free arcade of quick perception games — no sign-up, built to share."
      />

      <h1>About Tinty</h1>
      <p className="lede">
        Tinty is a small, free arcade of quick perception games you can play in a
        browser. No account, no download, no install. You open a page, play five
        short rounds, and get a score out of 50. Then you either try to beat it or
        send the link to someone who thinks they can.
      </p>

      <h2>The idea</h2>
      <p>
        Most games ask you to learn a system: rules, controls, upgrades, a meta.
        Tinty games ask you to do one small perceptual thing well — remember a
        color, judge a price — and then they measure how close you got. A round
        takes a few seconds. A whole game takes about a minute. There is nothing
        to master except your own eyes and instincts, which is exactly why it is
        fun to compare scores.
      </p>
      <p>
        The site is deliberately plain. One centered card holds the whole game.
        There are no popups over the play area, no energy timers, no reward
        loops engineered to keep you scrolling. The card, a score, and a link to
        share it — that is the entire product.
      </p>
      <p>
        Tinty is built to spread the way playground games spread: one person
        shows another. Every finished game can become a challenge link that
        seeds the exact same five rounds for a friend, and there is a global{' '}
        <strong>daily challenge</strong> — one set of five, the same for everyone
        on Earth that day, one attempt each, resetting at midnight UTC.
      </p>

      <h2>Color Match</h2>
      <p>
        You are shown a single flat color filling the whole card, with a short
        countdown. When the countdown ends the color disappears and you have to
        rebuild it from memory using three sliders — <strong>Hue</strong>,{' '}
        <strong>Saturation</strong> and <strong>Brightness</strong> — with the
        card filling live with whatever color you have dialed in. You submit,
        and the game shows your color next to the original and scores the round
        out of 10.
      </p>
      <p>
        Scoring does not compare the raw slider numbers. It converts both colors
        into the CIELAB color space and measures the perceptual distance between
        them using the CIEDE2000 formula — the same color-difference math used in
        printing and manufacturing. That means a guess is judged by how
        different it <em>looks</em>, not by how far the sliders moved. Get a
        muted brown slightly wrong and you will still score well; miss a vivid
        blue by the same slider distance and you will not.
      </p>
      <p>
        There are two modes. <strong>Easy</strong> gives you a longer look and
        keeps the colors bright and clearly saturated. <strong>Hard</strong>{' '}
        shortens the look and opens the palette up to near-blacks, near-whites
        and washed-out grays, which are much harder to pin down from memory.
      </p>
      <p>
        <a href="/learn/color-match">Full Color Match guide →</a>
      </p>

      <h2>Price Guess</h2>
      <p>
        You are shown a real product — a watch, a pair of sneakers, a handbag, a
        gadget, a motorbike, a car, a boat — and you guess what it costs by
        dragging a price slider. Five items, one score out of 50.
      </p>
      <p>
        Scoring is based on <strong>percentage error</strong>, not the raw
        dollar gap. Being $20 off on a $50 pair of shoes is a big miss; being
        $20 off on a $40,000 car is essentially perfect. The game measures how
        far your guess is from the real price as a fraction of that price, so a
        cheap item and an expensive one are judged on the same scale. Land
        within a few percent and you get close to full marks; the points fall
        away smoothly as the gap widens.
      </p>
      <p>
        <a href="/learn/price-guess">Full Price Guess guide →</a>
      </p>

      <h2>Where this sits</h2>
      <p>
        Tinty is part of a small genre of one-minute, score-driven browser
        games — the same spirit as sites like dialed.gg, which built a following
        around a single color-memory game with a daily challenge and shareable
        head-to-head links. These games work because they are honest: a short
        skill test, a clear number at the end, and a low-friction way to see if
        someone else can beat it. Tinty follows that template and adds more game
        types under one roof over time.
      </p>
      <p>
        The plan is to add more modes — reaction time, odd-one-out, number
        memory, an aim trainer — as sibling games on the same site, sharing the
        same card, the same daily-challenge idea and the same leaderboards.
      </p>

      <h2>Cost, ads and accounts</h2>
      <p>
        Tinty is free and intends to stay free. There are no accounts and
        nothing is for sale. Best scores and streaks are stored locally in your
        browser; the daily leaderboard stores only a short name you choose and
        your score. When advertising is eventually added it will be a single
        slot shown <em>between</em> games and never over the play area.
      </p>
      <p>
        Questions or feedback: <a href="mailto:bhonii.banna@gmail.com">bhonii.banna@gmail.com</a>.
      </p>
    </ArticlePage>
  )
}
