import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Home from './routes/Home.tsx'
import SoloGame from './routes/SoloGame.tsx'
import FriendsRoute from './routes/FriendsRoute.tsx'
import ChallengeGame from './routes/ChallengeGame.tsx'
import LiveRoute from './routes/LiveRoute.tsx'
import DailyGame from './routes/DailyGame.tsx'
import PriceHome from './routes/PriceHome.tsx'
import PriceSoloGame from './routes/PriceSoloGame.tsx'
import NotFound from './routes/NotFound.tsx'

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
        <Route path="/price" element={<PriceHome />} />
        <Route path="/price/solo" element={<PriceSoloGame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Passive — renders nothing, sends pageviews only on the Vercel deploy. */}
      <Analytics />
    </>
  )
}
