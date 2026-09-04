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

// Register the app-shell service worker (see public/sw.js). Production only —
// keeping it out of `vite dev` avoids stale-cache confusion while iterating.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a progressive enhancement — ignore failures.
    })
  })
}
