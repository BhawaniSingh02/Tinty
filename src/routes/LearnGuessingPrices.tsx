import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function LearnGuessingPrices() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/price-guess', label: 'How to play Price Guess' },
        { to: '/learn/remembering-colors', label: 'Why humans are bad at remembering colors' },
        { to: '/learn', label: 'All guides & articles' },
      ]}
    >
      <Seo
        path="/learn/guessing-prices"
        title="The psychology of guessing prices"
        description="Why estimating prices is hard: anchoring, reference prices, charm pricing and brand premiums, and how sellers set numbers for how they read rather than what things cost."
      />

      <h1>The psychology of guessing prices</h1>
      <p className="lede">
        Guessing what something costs feels like it should be easy — you have
        seen thousands of prices. But price knowledge is patchy, heavily
        anchored, and shaped by the fact that prices are designed to persuade
        you, not to inform you.
      </p>

      <h2>You judge prices by comparison, not value</h2>
      <p>
        People almost never estimate a price by reasoning up from materials and
        labor. Instead you reach for a <strong>reference price</strong> — a
        remembered price for something similar — and adjust. Ask someone what a
        blender costs and they picture the last blender they saw and nudge from
        there. This works well inside categories you shop in often and badly
        everywhere else, because you have no nearby reference to adjust from. A
        person who has never bought a road bike is not a little uncertain about
        its price; they are missing the anchor entirely and can be off by a
        factor of ten.
      </p>

      <h2>Anchoring pulls your guess around</h2>
      <p>
        <strong>Anchoring</strong> is the tendency for the first number you
        encounter to drag your estimate toward it, even when the number is
        arbitrary. It is one of the most robust findings in decision research.
        Sellers use it deliberately: the &ldquo;was $200, now $120&rdquo; tag
        makes $120 feel cheap because $200 was planted first; a $4,000 watch in
        the case makes the $800 one next to it look sensible. In a guessing game
        the anchor can be subtler — the previous item you were shown, the range
        of the slider, or a brand name that primes &ldquo;expensive&rdquo; before
        you have looked at the object. Being aware that a number is tugging at
        you is a partial defense; deciding your own rough estimate before you
        look at any cues is a better one.
      </p>

      <h2>Prices are engineered to read a certain way</h2>
      <p>
        The number on the tag is a designed object. A few of the patterns:
      </p>
      <ul>
        <li>
          <strong>Charm pricing.</strong> Prices ending in 9 or 99 ($19.99,
          $499) are read as meaningfully lower than the next round number,
          partly because people anchor on the leftmost digit. Retailers use them
          for value-focused goods.
        </li>
        <li>
          <strong>Round pricing for premium goods.</strong> Luxury and
          &ldquo;considered&rdquo; purchases often use clean numbers ($1,200,
          $3,000) because precise-looking prices signal a bargain and premium
          brands do not want to signal that.
        </li>
        <li>
          <strong>Prestige markups.</strong> For status goods, a higher price can
          increase demand, because the price <em>is</em> part of the product. The
          cost to make two similar handbags may be close; the gap in price is the
          brand, and it is not a mistake.
        </li>
        <li>
          <strong>Price ending as a quality cue.</strong> When people genuinely
          do not know what something should cost, they read the price itself as
          information — a higher price is taken as evidence of higher quality,
          which lets unfamiliar categories carry wide price ranges.
        </li>
      </ul>

      <h2>Your knowledge is lopsided</h2>
      <p>
        Most people have accurate price knowledge for frequently bought, low-cost
        items — milk, coffee, a movie ticket — and it degrades quickly as items
        get rarer and more expensive. Inflation makes it worse: remembered
        prices lag reality by years, so long-lived items (cars, appliances,
        rent) are systematically underestimated by people quoting the price they
        &ldquo;know.&rdquo; And expertise cuts both ways. If you follow a
        category, you know its high end intimately and tend to overestimate the
        basics; if you ignore a category, you underestimate how steeply price
        rises with quality once you leave the entry level.
      </p>

      <h2>Estimating better</h2>
      <p>
        The practical moves follow from the biases. Fix the order of magnitude
        before anything else — most large errors are being in the wrong band, not
        being imprecise within the right one. Anchor to a specific thing you have
        actually paid for rather than a vague sense of &ldquo;what these cost.&rdquo;
        Separate the object from its brand and price each part. Expect real
        prices to sit just below round numbers. And when you are genuinely
        unsure, lean low: overestimating by a factor costs far more, in a
        percentage-scored game and in life, than underestimating by the same
        feel. That reasoning is applied directly to gameplay in{' '}
        <a href="/learn/price-guess">How to play Price Guess</a>.
      </p>
    </ArticlePage>
  )
}
