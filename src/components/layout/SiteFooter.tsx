export default function SiteFooter() {
  return (
    <footer className="flex w-full shrink-0 justify-center gap-4 px-4 pt-2 pb-4 text-xs text-text-dim/70">
      <a href="/privacy" className="transition-colors hover:text-text-dim">
        Privacy
      </a>
      <span aria-hidden="true">·</span>
      <span>tinty.fun</span>
    </footer>
  )
}
