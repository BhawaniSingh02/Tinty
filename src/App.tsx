import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Home from './routes/Home.tsx'
import SoloGame from './routes/SoloGame.tsx'
import FriendsRoute from './routes/FriendsRoute.tsx'
import ChallengeGame from './routes/ChallengeGame.tsx'
import LiveRoute from './routes/LiveRoute.tsx'
import DailyGame from './routes/DailyGame.tsx'
import Leaderboard from './routes/Leaderboard.tsx'
import PriceHome from './routes/PriceHome.tsx'
import PriceSoloGame from './routes/PriceSoloGame.tsx'
import PriceFriendsRoute from './routes/PriceFriendsRoute.tsx'
import PriceChallengeGame from './routes/PriceChallengeGame.tsx'
import PriceLiveRoute from './routes/PriceLiveRoute.tsx'
import PriceDailyGame from './routes/PriceDailyGame.tsx'
import PuzzleHome from './routes/PuzzleHome.tsx'
import PuzzleSoloGame from './routes/PuzzleSoloGame.tsx'
import PuzzleFriendsRoute from './routes/PuzzleFriendsRoute.tsx'
import PuzzleChallengeGame from './routes/PuzzleChallengeGame.tsx'
import PuzzleLiveRoute from './routes/PuzzleLiveRoute.tsx'
import PuzzleDailyGame from './routes/PuzzleDailyGame.tsx'
import PuzzleGalleryRoute from './routes/PuzzleGalleryRoute.tsx'
import Privacy from './routes/Privacy.tsx'
import About from './routes/About.tsx'
import Contact from './routes/Contact.tsx'
import Learn from './routes/Learn.tsx'
import GuideColorMatch from './routes/GuideColorMatch.tsx'
import GuidePriceGuess from './routes/GuidePriceGuess.tsx'
import GuidePicturePuzzle from './routes/GuidePicturePuzzle.tsx'
import LearnRememberingColors from './routes/LearnRememberingColors.tsx'
import LearnGuessingPrices from './routes/LearnGuessingPrices.tsx'
import LearnColorPerception from './routes/LearnColorPerception.tsx'
import NotFound from './routes/NotFound.tsx'
import InstallPrompt from './components/layout/InstallPrompt.tsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<SoloGame />} />
        <Route path="/friends" element={<FriendsRoute />} />
        <Route path="/c/:code" element={<ChallengeGame />} />
        <Route path="/live/:code" element={<LiveRoute />} />
        <Route path="/daily" element={<DailyGame />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/price" element={<PriceHome />} />
        <Route path="/price/solo" element={<PriceSoloGame />} />
        <Route path="/price/friends" element={<PriceFriendsRoute />} />
        <Route path="/price/c/:code" element={<PriceChallengeGame />} />
        <Route path="/price/live/:code" element={<PriceLiveRoute />} />
        <Route path="/price/daily" element={<PriceDailyGame />} />
        <Route path="/puzzle" element={<PuzzleHome />} />
        <Route path="/puzzle/solo" element={<PuzzleSoloGame />} />
        <Route path="/puzzle/friends" element={<PuzzleFriendsRoute />} />
        <Route path="/puzzle/c/:code" element={<PuzzleChallengeGame />} />
        <Route path="/puzzle/live/:code" element={<PuzzleLiveRoute />} />
        <Route path="/puzzle/daily" element={<PuzzleDailyGame />} />
        <Route path="/puzzle/gallery" element={<PuzzleGalleryRoute />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/color-match" element={<GuideColorMatch />} />
        <Route path="/learn/price-guess" element={<GuidePriceGuess />} />
        <Route path="/learn/picture-puzzle" element={<GuidePicturePuzzle />} />
        <Route path="/learn/remembering-colors" element={<LearnRememberingColors />} />
        <Route path="/learn/guessing-prices" element={<LearnGuessingPrices />} />
        <Route path="/learn/color-perception" element={<LearnColorPerception />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <InstallPrompt />
      {/* Passive — renders nothing, sends pageviews only on the Vercel deploy. */}
      <Analytics />
    </>
  )
}
