import { useParams } from 'react-router-dom'
import RouteStub from '../components/RouteStub.tsx'

// Placeholder — the shared-seed lobby (challenge + live head-to-head)
// lands in build steps 6 & 8.
export default function ChallengeGame() {
  const { code } = useParams()
  return <RouteStub title={`Challenge · ${code ?? ''}`} />
}
