import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function LearnColorPerception() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/remembering-colors', label: 'Why humans are bad at remembering colors' },
        { to: '/learn/color-match', label: 'How to play Color Match' },
        { to: '/learn', label: 'All guides & articles' },
      ]}
    >
      <Seo
        path="/learn/color-perception"
        title="How color perception works"
        description="A short, accurate tour of colour vision: three types of cone, opponent processing, why colour is constructed by the brain, colour constancy, and what CIELAB and CIEDE2000 are for."
      />

      <h1>How color perception works</h1>
      <p className="lede">
        Color is not a property of light on its own. It is something your visual
        system builds from a very limited set of measurements. Understanding how
        that construction works explains a lot about why color games — and color
        matching in general — behave the way they do.
      </p>

      <h2>Three measurements, then everything else is inference</h2>
      <p>
        Light entering your eye lands on the retina, where two kinds of receptor
        sit: rods, which handle dim light and do not contribute much to color,
        and cones, which do. Most people have three types of cone, usually called
        L, M and S for the long, medium and short wavelengths they respond to
        most strongly — very roughly, reddish, greenish and bluish light. Their
        sensitivity ranges overlap heavily.
      </p>
      <p>
        That is the entire input: three numbers, one per cone type, at each point
        in the visual field. Every color you have ever seen is the brain&rsquo;s
        interpretation of the ratios between those three numbers. It also means
        very different mixtures of wavelengths can produce the same three cone
        responses and therefore look identical — these are called metamers, and
        they are why a screen with just red, green and blue subpixels can
        reproduce a convincing yellow without emitting any yellow light.
      </p>

      <h2>The signal is repackaged into opponent channels</h2>
      <p>
        The raw cone responses do not travel to the brain unchanged. In the
        retina they are combined into <strong>opponent channels</strong>: a
        light–dark channel, a red–green channel, and a blue–yellow channel. This
        is why you can picture a reddish-yellow (orange) or a bluish-green (teal)
        but not a reddish-green or a bluish-yellow — those pairs are opposite ends
        of a single channel and cannot both be positive at once. Opponent
        processing also produces afterimages: fatigue one side of a channel by
        staring, look away, and the other side rebounds.
      </p>

      <h2>The brain corrects for the light</h2>
      <p>
        The light bouncing off an object depends as much on the light source as
        on the object. A white shirt outdoors reflects bluish daylight; indoors
        it reflects warm yellowish bulb light. Yet the shirt looks white in both
        places, because your visual system estimates the illumination and
        discounts it — an effect called <strong>color constancy</strong>. It is
        usually helpful and occasionally fails spectacularly, which is what made
        &ldquo;the dress&rdquo; go viral: an ambiguous photo where different
        people&rsquo;s brains assumed different lighting and so saw different
        colors. The practical lesson is that the color you perceive depends on
        surroundings and context, not just on the pixels.
      </p>

      <h2>Describing color with numbers</h2>
      <p>
        Because color is perceptual, useful color models try to match perception
        rather than physics. <strong>HSB</strong> (hue, saturation, brightness),
        the model Color Match&rsquo;s sliders use, is a simple one: it reorganizes
        screen color into three dials that line up with how people talk about
        color. It is easy to use but not perceptually even — a fixed step on the
        hue dial is a much bigger visible change in some places than others.
      </p>
      <p>
        <strong>CIELAB</strong> was built to fix that. It arranges colors so that
        the straight-line distance between any two of them corresponds
        approximately to how different they look, with axes for lightness,
        green–red and blue–yellow (the same opponent structure as your visual
        system). <strong>CIEDE2000</strong> is a refinement of the distance
        formula in that space, tuned against large sets of human judgments about
        which color pairs look equally different. A CIEDE2000 difference of about
        1 is near the threshold of what people notice. It is the standard tool
        for deciding whether two colors match in industries where that matters,
        and it is what Tinty uses to score how close your remembered color is to
        the original — so a guess is always judged by how different it looks, not
        by how far a slider moved.
      </p>
    </ArticlePage>
  )
}
