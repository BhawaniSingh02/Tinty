import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Nothing here</h1>
      <Link to="/" className="text-accent">
        Back to tinty
      </Link>
    </main>
  )
}
