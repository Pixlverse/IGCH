import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/styles/admin.css'

export const metadata: Metadata = {
  title: { default: 'IGCH Admin', template: '%s · IGCH Admin' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin">{children}</div>
}
