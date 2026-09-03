/** Tucked into the bottom-left corner, out of the page's normal flow, so it
 *  never eats into the game card's vertical space or forces a scrollbar. */
export default function SiteFooter() {
  return (
    <footer className="fixed bottom-3 left-4 z-0 flex items-center gap-2 text-xs text-text-dim/60">
      <a href="/privacy" className="transition-colors hover:text-text-dim">
        Privacy
      </a>
      <span aria-hidden="true">·</span>
      <a href="/about" className="transition-colors hover:text-text-dim">
        About
      </a>
      <span aria-hidden="true">·</span>
      <a href="/contact" className="transition-colors hover:text-text-dim">
        Contact
      </a>
      <span aria-hidden="true">·</span>
      <span>tinty.fun</span>
    </footer>
  )
}
