import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { getNavigation, getSiteSettings } from '@/lib/content'

/** Public website chrome: header, page, footer. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [site, nav] = await Promise.all([getSiteSettings(), getNavigation()])
  return (
    <div className="container">
      <Header site={site} nav={nav} />
      {children}
      <Footer site={site} nav={nav} />
    </div>
  )
}
