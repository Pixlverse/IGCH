import Link from 'next/link'

import type { SiteSettings } from '@/lib/content/schemas'

import { ContentImage } from './ContentImage'

/** Header logo lockup: logo tile, hospital name and location line. */
export function Brand({ site }: { site: SiteSettings }) {
  return (
    <Link href="/" className="brand">
      <span className="brand__logo">
        <ContentImage image={site.logo} width={48} height={48} sizes="40px" priority />
      </span>
      <span>
        <span className="brand__name">{site.name}</span>
        <br />
        <span className="brand__loc">{site.locationLine}</span>
      </span>
    </Link>
  )
}
