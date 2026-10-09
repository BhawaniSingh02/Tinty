import ArticlePage from '../components/content/ArticlePage.tsx'
import Seo from '../components/Seo.tsx'

export default function GuidePicturePuzzle() {
  return (
    <ArticlePage
      related={[
        { to: '/learn/color-match', label: 'How to play Color Match' },
        { to: '/learn/price-guess', label: 'How to play Price Guess' },
        { to: '/learn', label: 'All guides & articles' },
      ]}
    >
      <Seo
        path="/learn/picture-puzzle"
        title="How to play Picture Puzzle — swapping, scoring and solving tips"
        description="A full guide to Tinty's Picture Puzzle: how swapping works, the three grid sizes, how time, moves and peeks are scored, the daily puzzle, racing friends, and tips to solve faster."
      />

      <h1>How to play Picture Puzzle</h1>
      <p className="lede">
        Picture Puzzle takes a photo, cuts it into square tiles and shuffles
        them. Your job is to swap the tiles back until the picture is whole
        again. It is quick to learn, and there is real skill in doing it fast
        and in as few moves as possible.
      </p>

      <h2>A round, step by step</h2>
      <ol>
        <li>
          <strong>Preview.</strong> The finished picture is shown for three
          seconds. Take in the big shapes — where the horizon sits, where the
          bright and dark areas are. Tap to skip the wait if you are ready.
        </li>
        <li>
          <strong>Shuffle.</strong> The picture is cut into a grid and every tile
          is moved somewhere else. The clock starts.
        </li>
        <li>
          <strong>Swap.</strong> Tap one tile, then another, and they trade
          places. On a computer you can also drag a tile onto another. Tap a
          selected tile again to put it down.
        </li>
        <li>
          <strong>Lock in.</strong> When a tile lands in its correct spot it
          glows and locks, so it can&rsquo;t be moved by mistake. The counter
          under the board shows how many tiles are home.
        </li>
        <li>
          <strong>Solve.</strong> When the last tile lands, the grid lines
          disappear and the photo snaps together. You get a score out of 10.
        </li>
      </ol>

      <h2>Grid sizes</h2>
      <ul>
        <li>
          <strong>Easy — 3×3</strong>, nine tiles. A warm-up; usually solved in
          well under a minute.
        </li>
        <li>
          <strong>Medium — 4×4</strong>, sixteen tiles. The daily puzzle always
          uses this size.
        </li>
        <li>
          <strong>Hard — 5×5</strong>, twenty-five tiles. Small tiles with less
          picture on each, so reading the detail matters.
        </li>
      </ul>
      <p>
        Every shuffle is solvable — with swaps, any arrangement can be put
        back — and the game never deals you a board that is already nearly
        finished.
      </p>

      <h2>How scoring works</h2>
      <p>
        Your score is out of 10 and comes from three things: how long you took,
        how many swaps you used, and whether you peeked. It is a smooth curve,
        not a set of brackets, so a slightly faster solve always scores a
        slightly higher number.
      </p>
      <ul>
        <li>
          <strong>Time</strong> carries the most weight. What counts as fast
          depends on the grid: around 20 seconds is quick on a 3×3, around 50 on
          a 4×4 and around a minute and a half on a 5×5.
        </li>
        <li>
          <strong>Moves</strong> are compared with the fewest swaps that could
          possibly solve <em>your</em> board, which the results screen shows as
          &ldquo;best&rdquo;. Matching it is perfect; doubling it costs a few
          points. Because it is measured against your own board, a lucky or
          unlucky shuffle doesn&rsquo;t change what a good game looks like.
        </li>
        <li>
          <strong>Peeking</strong> shows the full picture again for two seconds.
          It is there when you are stuck, and each peek trims about 7% off the
          score.
        </li>
      </ul>
      <p>
        As a rough guide, a fast solve with only a couple of extra moves lands
        above 9, a steady solve sits around 7 to 8, and a slow one with lots of
        wandering swaps ends up around 3 to 5.
      </p>

      <h2>Ways to play</h2>
      <ul>
        <li>
          <strong>Solo</strong> — a new picture and a new shuffle every round.
          Your best score is kept separately for each grid size.
        </li>
        <li>
          <strong>Daily challenge</strong> — one picture and one 4×4 shuffle,
          the same for everyone in the world, and you get a single attempt. It
          resets at midnight UTC and has its own leaderboard.
        </li>
        <li>
          <strong>Challenge link</strong> — finish a puzzle, copy the link and
          send it. Your friend solves the identical board and sees both results
          side by side.
        </li>
        <li>
          <strong>Live race</strong> — host a room, share the link, and you both
          start the same puzzle at the same moment. You can watch your
          opponent&rsquo;s tile count climb while you solve.
        </li>
      </ul>

      <h2>The gallery</h2>
      <p>
        There are fifty photos in five packs — nature, cities, animals, space
        and food. Every picture you solve, in any mode, is added to your
        gallery; the rest stay greyed out until you meet them in a game. Your
        collection is stored on your device. The photos come from Unsplash and
        each one is credited on the results screen.
      </p>

      <h2>Tips for faster solves</h2>
      <ul>
        <li>
          <strong>Use the preview for structure, not detail.</strong> Three
          seconds is enough to notice the sky is at the top or the subject sits
          left of centre. That tells you where most tiles belong.
        </li>
        <li>
          <strong>Start with the tiles that are easy to place.</strong> Corners,
          edges and tiles with an obvious feature — a horizon, a bright sun, an
          eye — usually have only one possible home.
        </li>
        <li>
          <strong>Swap a tile straight to its home.</strong> Every swap that
          puts one tile in its correct spot is never wasted. Swaps between two
          wrong spots are what push your move count up.
        </li>
        <li>
          <strong>Follow the chain.</strong> When you put a tile home, look at
          the tile it displaced: it now sits somewhere else, and often its own
          home is obvious. Chasing that chain is close to the optimal way to
          solve.
        </li>
        <li>
          <strong>Peek late, not early.</strong> Once most tiles are locked in,
          the remaining few are usually the hardest — sky, water, shadow. That
          is when a two-second peek pays for itself.
        </li>
      </ul>
    </ArticlePage>
  )
}
