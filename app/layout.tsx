import { Analytics } from '@vercel/analytics/next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'

import { SvgSprite } from '@/components/icons/SvgSprite'

// Original stylesheet, split verbatim into partials. Import order is the cascade order.
import '@/styles/00-tokens.css'
import '@/styles/01-base.css'
import '@/styles/02-shared.css'
import '@/styles/03-header.css'
import '@/styles/04-hero.css'
import '@/styles/05-stats.css'
import '@/styles/06-centres.css'
import '@/styles/07-specialities.css'
import '@/styles/08-doctors.css'
import '@/styles/09-guide.css'
import '@/styles/10-walkthrough.css'
import '@/styles/11-facilities.css'
import '@/styles/12-coop.css'
import '@/styles/13-news.css'
import '@/styles/14-blogs.css'
import '@/styles/15-faq.css'
import '@/styles/16-nursing.css'
import '@/styles/17-footer.css'
// Inner pages (Phase 1 designs)
import '@/styles/20-pages.css'
import '@/styles/21-about.css'
import '@/styles/22-specialities.css'
import '@/styles/23-news.css'
import '@/styles/24-library.css'
import '@/styles/25-facilities.css'
import '@/styles/26-careers.css'
import '@/styles/90-responsive.css'
import '@/styles/99-performance.css'

// Self-hosted Plus Jakarta Sans: the exact latin variable file Google Fonts
// served the original for weights 400–800. No generated metric fallback, so
// glyphs the font lacks (e.g. "→") fall through to system-ui as before.
const jakarta = localFont({
  src: './fonts/PlusJakartaSans-latin-var.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-jakarta',
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

/** Document shell shared by the public site (app/(site)) and the admin (app/admin). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior: Next turns off the CSS smooth scroll during route changes
    <html lang="en" className={jakarta.variable} data-scroll-behavior="smooth">
      <body>
        <SvgSprite />
        {children}
        {/* Only on Vercel, where /_vercel/insights exists */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
