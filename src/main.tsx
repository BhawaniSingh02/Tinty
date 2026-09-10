import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initInstallCapture } from './game/installPrompt.ts'

// Grab Chrome's `beforeinstallprompt` before it can show its own mini-infobar.
// The prompt is offered later, after a completed game (see InstallPrompt.tsx).
initInstallCapture()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Fade out the static first-paint shell (see #boot in index.html) once React
// has painted a real frame underneath it — no flash, no layout jump.
function dismissBootShell() {
  const boot = document.getElementById('boot')
  if (!boot) return
  document.documentElement.classList.add('boot-done')
  const done = () => boot.remove()
  boot.addEventListener('transitionend', done, { once: true })
  // Fallback in case the transition is skipped (reduced motion, etc.).
  setTimeout(done, 500)
}
requestAnimationFrame(() => requestAnimationFrame(dismissBootShell))

// Register the app-shell service worker (see public/sw.js). Production only —
// keeping it out of `vite dev` avoids stale-cache confusion while iterating.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a progressive enhancement — ignore failures.
    })
  })
}
