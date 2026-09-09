import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function GuideColorMatch() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/remembering-colors', label: 'Why humans are bad at remembering colors' },
        { to: '/learn/color-perception', label: 'How color perception works' },
        { to: '/learn/price-guess', label: 'How to play Price Guess' },
      ]}
    >
      <Seo
        path="/learn/color-match"
        title="How to play Color Match — a guide to HSB, sliders and scoring"
        description="A full guide to Color Match: what Hue, Saturation and Brightness mean, how to use the sliders, Easy vs Hard mode, how CIEDE2000 scoring works, and tips to improve."
      />

      <h1>How to play Color Match</h1>
      <p className="lede">
        Color Match is a color-memory game. You see a color, it disappears, and
        you rebuild it from memory with three sliders. Five rounds, scored out of
        50. This guide covers how it works, what the sliders actually do, and how
        to get better at it.
      </p>

      <h2>The round, step by step</h2>
      <ol>
        <li>
          A single flat color fills the whole card, with a short countdown
          labelled &ldquo;seconds to remember.&rdquo; You can tap or click to
          skip ahead as soon as you feel you have it.
        </li>
        <li>The color vanishes and the slider picker appears.</li>
        <li>
          You dial in your best reproduction. The card fills live with the color
          you currently have, so you are always looking at your answer full-size.
        </li>
        <li>
          You press the target button to submit. The card splits: your color on
          one half with its H/S/B numbers, the original on the other with its
          numbers, and a score out of 10 with a one-line verdict.
        </li>
        <li>After five rounds you get a total out of 50 and a breakdown.</li>
      </ol>
      <p>
        The sliders reset to a neutral middle position every round. There is no
        head start from the previous color.
      </p>

      <h2>What HSB means</h2>
      <p>
        The picker uses <strong>HSB</strong> — Hue, Saturation, Brightness (the
        &ldquo;B&rdquo; is sometimes called Value, as in HSV; it is the same
        thing). It is a way of describing a color with three intuitive dials
        instead of red, green and blue amounts. Each Tinty slider controls one
        of them:
      </p>
      <h3>Hue (0–360)</h3>
      <p>
        Which color it is, as a position on the color wheel, measured in
        degrees. Red sits at 0, yellow near 60, green near 120, cyan near 180,
        blue near 240, magenta near 300, and then it wraps back to red. The Hue
        slider is a full rainbow gradient. This is the dial your eye notices
        first, and also the one people misremember most — see the note on Easy
        mode below.
      </p>
      <h3>Saturation (0–100)</h3>
      <p>
        How pure or how gray the color is. At 100 the color is as vivid as the
        screen can show it. At 0 there is no color information left at all — just
        a shade of gray — and at that point the Hue slider does almost nothing,
        because gray has no hue to speak of. Most real-world colors live
        somewhere in the middle.
      </p>
      <h3>Brightness (0–100)</h3>
      <p>
        How much light the color gives off. At 0 it is black regardless of the
        other two sliders. At 100 it is the lightest that hue and saturation can
        be. Lowering brightness on a saturated hue gives you the &ldquo;deep&rdquo;
        version of a color (navy, maroon, forest); raising it toward 100 while
        also lowering saturation gives you pastels.
      </p>
      <p>
        A practical order that works for most people: set Hue first to get the
        family right, then Brightness to match how light or dark it felt, then
        Saturation last to match how vivid or how washed-out it was.
      </p>

      <h2>Why this is genuinely hard</h2>
      <p>
        Color memory is weak and gets weaker fast. Within a couple of seconds of
        a color leaving the screen, most people are no longer remembering the
        exact color — they are remembering a <em>label</em> (&ldquo;a dusty
        blue-green&rdquo;) and then reconstructing a color to fit the label. That
        reconstruction drifts toward the typical, most-nameable version of that
        category, so subtle or in-between colors come back more ordinary than
        they were. Brightness and saturation are especially slippery because
        there is no everyday vocabulary for small differences in them. There is a
        longer write-up of the science in{' '}
        <a href="/learn/remembering-colors">
          Why humans are bad at remembering colors
        </a>
        .
      </p>

      <h2>Easy vs Hard</h2>
      <p>Two things change between the modes:</p>
      <ul>
        <li>
          <strong>Time to memorise.</strong> Easy gives you a longer look. Hard
          cuts it short, so you get less time to build a stable impression.
        </li>
        <li>
          <strong>The palette.</strong> Easy only shows clearly saturated,
          mid-brightness colors — the kind that have obvious names and are
          easier to hold in memory and to dial back in. Hard opens the whole
          range: near-blacks, near-whites, and low-saturation grays and
          muddy tones, which are the hardest colors to reproduce because small
          errors are very visible and the sliders feel less responsive down
          there.
        </li>
      </ul>
      <p>
        Start on Easy until you are comfortable with which slider does what.
        Hard is worth playing for the low-saturation rounds alone — they teach
        you how little the Hue slider matters once Saturation is near the floor.
      </p>

      <h2>How scoring works</h2>
      <p>
        The score is <strong>not</strong> the difference between your slider
        numbers and the target&rsquo;s. That would be misleading: at very low
        saturation a hue that is 150° &ldquo;wrong&rdquo; barely changes the
        color you actually see, and near maximum saturation a 15° hue error is
        glaring.
      </p>
      <p>
        Instead, Tinty converts both colors into <strong>CIELAB</strong>, a
        color space designed so that equal numeric distances correspond roughly
        to equal <em>visible</em> differences, and then measures the gap between
        them with the <strong>CIEDE2000</strong> formula. CIEDE2000 is an
        industry standard — it is what paint, textile and print companies use to
        decide whether two batches of color are an acceptable match. A
        difference of about 1 unit is roughly the smallest change a person can
        notice side by side.
      </p>
      <p>
        Tinty turns that difference into points on a smooth curve: a
        near-perfect match is a flat 10, the points fall away gently through the
        &ldquo;close but clearly off&rdquo; range, and a wildly wrong color tails
        to zero. Because the whole thing is driven by perceived difference, a
        guess that <em>looks</em> close scores well even if one slider is fairly
        far off — which is exactly the outcome you want from a color game.
      </p>

      <h2>Tips to improve</h2>
      <ul>
        <li>
          <strong>Name it in words while you can still see it.</strong> &ldquo;
          Medium teal, fairly muted, a bit dark.&rdquo; A verbal anchor survives
          much better than a raw visual impression.
        </li>
        <li>
          <strong>Commit to a hue family fast</strong> and spend your remaining
          look confirming brightness and saturation, which are the parts you are
          most likely to get wrong.
        </li>
        <li>
          <strong>Skip early.</strong> Staring at the swatch for the full
          countdown rarely helps after the first second or two, and the extra
          time can make you second-guess a correct first impression.
        </li>
        <li>
          <strong>Use the live fill.</strong> Once you are roughly there, stop
          looking at the slider handles and judge the full-card color directly
          against your memory.
        </li>
        <li>
          <strong>On grayish colors, get Brightness right first.</strong> When
          saturation is low, brightness is doing almost all the work and hue is
          nearly irrelevant.
        </li>
        <li>
          <strong>Don&rsquo;t over-saturate.</strong> A very common mistake is
          remembering colors as more vivid than they were. If you are unsure,
          nudge saturation down.
        </li>
      </ul>
    </ArticlePage>
  )
}
