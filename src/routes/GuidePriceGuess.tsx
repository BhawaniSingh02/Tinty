import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function GuidePriceGuess() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/guessing-prices', label: 'The psychology of guessing prices' },
        { to: '/learn/color-match', label: 'How to play Color Match' },
        { to: '/learn', label: 'All guides & articles' },
      ]}
    >
      <Seo
        path="/learn/price-guess"
        title="How to play Price Guess — percentage scoring and estimation tips"
        description="A full guide to Price Guess: how a round works, why scoring is based on percentage error rather than the dollar gap, the product categories, and tips for estimating prices."
      />

      <h1>How to play Price Guess</h1>
      <p className="lede">
        Price Guess shows you a real product and asks what it costs. You set your
        guess with a slider. Five items, one score out of 50. This guide explains
        the scoring — which is the part that surprises people — and how to
        estimate prices for things you have never bought.
      </p>

      <h2>The round, step by step</h2>
      <ol>
        <li>
          You see a product: its picture, its name and its brand. Sometimes it is
          something you know well, sometimes it is not.
        </li>
        <li>
          You drag a slider to your guess. The slider covers a wide range, so
          the first move is deciding roughly what order of magnitude you are in —
          tens, hundreds, thousands, tens of thousands.
        </li>
        <li>You lock in your guess and the real price is revealed.</li>
        <li>
          You get a score out of 10 for the round, based on how close your guess
          was <em>in percentage terms</em> (see below).
        </li>
        <li>After five items you get a total out of 50.</li>
      </ol>

      <h2>Why scoring is percentage-based</h2>
      <p>
        This is the key thing to understand. Price Guess does not score you on
        the raw dollar difference between your guess and the real price. It
        scores you on the difference <strong>as a fraction of the real price</strong>.
      </p>
      <p>
        Being $30 off matters completely differently depending on the item. On a
        $45 phone case, $30 off is a 67% error — a bad guess. On a $38,000 car,
        $30 off is a rounding error. If the game used the dollar gap, the car
        rounds would be worth far more points than the phone-case rounds for the
        same quality of estimate, and every game would come down to whether you
        happened to nail the one expensive item. Percentage error puts a cheap
        keychain and an expensive motorbike on the same scale: what is being
        tested is always &ldquo;how close were you, relative to the thing&rsquo;s
        actual value.&rdquo;
      </p>
      <p>
        The points curve is smooth. Land within a couple of percent and you are
        near a perfect 10. Around 10% off you are still in good shape. A guess
        that is clearly wrong but in the right ballpark — say a quarter to a
        third off — lands in the middle of the range. Past roughly half off, the
        points drop toward zero. There are no brackets or cliffs: a guess that is
        1% better than another scores a hair higher, not a whole point higher.
      </p>
      <p>
        One consequence worth knowing:{' '}
        <strong>being off by a factor is very expensive</strong>. Guessing $200
        for a $100 item is a 100% error and scores near zero — the same as
        guessing $0. Underestimating has a floor (you can only be 100% low) but
        overestimating does not, so when you are unsure it is usually safer to
        lean toward the lower end of your range.
      </p>

      <h2>The categories</h2>
      <p>
        Items are drawn from a fixed set of product categories, each with a mix
        of budget, mid-range and premium examples:
      </p>
      <ul>
        <li>
          <strong>Watches</strong> — from $10 digital watches to luxury
          mechanical pieces.
        </li>
        <li>
          <strong>Sneakers and shoes</strong> — mass-market up to limited
          releases.
        </li>
        <li>
          <strong>Bags and everyday carry</strong> — backpacks through designer
          handbags.
        </li>
        <li>
          <strong>Perfume and fragrance</strong> — drugstore to niche house.
        </li>
        <li>
          <strong>Tech and gadgets</strong> — small accessories up to premium
          devices.
        </li>
        <li>
          <strong>Motorbikes</strong>, <strong>cars</strong> and{' '}
          <strong>boats</strong> — the big-ticket categories, where percentage
          scoring matters most.
        </li>
      </ul>
      <p>
        Prices are real reference prices for a specific model, not averages for
        the category, so a &ldquo;watch&rdquo; could be $12 or $12,000.
      </p>

      <h2>Estimating prices you don&rsquo;t know</h2>
      <ul>
        <li>
          <strong>Nail the order of magnitude first.</strong> Deciding between
          &ldquo;hundreds&rdquo; and &ldquo;thousands&rdquo; is worth far more
          than fine-tuning within the right band. Most lost points come from
          being in the wrong band entirely.
        </li>
        <li>
          <strong>Anchor to something you have actually bought.</strong> If you
          know what one pair of running shoes costs, you can place most other
          sneakers relative to it. Your own recent purchases are the most
          reliable reference points you have.
        </li>
        <li>
          <strong>Separate the brand from the object.</strong> A plain leather
          tote and a designer one may be nearly identical objects; most of the
          price difference is the label. Ask what the materials and manufacturing
          are worth, then add a premium for the brand rather than pricing the
          logo directly.
        </li>
        <li>
          <strong>Remember that listed prices are engineered.</strong> Retail
          prices cluster just under round numbers ($99, $1,995) and are set for
          how they read, not by adding up costs. Guessing a clean round number
          will often leave you a little high.
        </li>
        <li>
          <strong>Correct for your own bubble.</strong> If you follow a category
          closely you probably know the premium end and will overguess the
          basics. If you never buy in a category you will likely underguess how
          fast prices climb once quality goes up.
        </li>
        <li>
          <strong>When unsure, bias low.</strong> Because percentage error
          punishes overestimates harder than underestimates, the center of your
          guessing range should sit slightly below your true expectation.
        </li>
      </ul>
      <p>
        There is more on why this is hard — anchoring, reference prices, brand
        premiums and charm pricing — in{' '}
        <a href="/learn/guessing-prices">The psychology of guessing prices</a>.
      </p>
    </ArticlePage>
  )
}
