import type { ReactNode } from 'react'
import SiteHeader from './SiteHeader.tsx'
import SiteFooter from './SiteFooter.tsx'

/**
 * The page frame shared by every screen: a slim site header/footer with the
 * game card dead-centre at a fixed max width on every screen size. No banner
 * or rail ad slots — the only ad placement is the between-rounds interstitial
 * (see <AdSlot>), wired up in a later step.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-bg">
      <SiteHeader />

      <main className="flex w-full flex-1 items-center justify-center px-4 py-6">
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}
