import { Routes, Route } from 'react-router-dom'
import Home from './routes/Home.tsx'
import SoloGame from './routes/SoloGame.tsx'
import ChallengeGame from './routes/ChallengeGame.tsx'
import DailyGame from './routes/DailyGame.tsx'
import NotFound from './routes/NotFound.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/solo" element={<SoloGame />} />
      <Route path="/c/:code" element={<ChallengeGame />} />
      <Route path="/daily" element={<DailyGame />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
