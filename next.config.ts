import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // the admin e2e suite builds into its own folder (scripts/admin-test-server.mjs)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // 'use cache' + cacheTag power the content layer (see lib/content)
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [80],
    // admin uploads (lib/admin/storage.ts)
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  experimental: {
    // admin image/PDF uploads go through server actions (3 MB files + form overhead)
    serverActions: { bodySizeLimit: '4mb' },
  },
  // The original site is a single page with fragment links only, so no
  // redirects are required. Add any future URL changes here.
  async redirects() {
    return [{ source: '/index.html', destination: '/', permanent: true }]
  },
}

export default nextConfig
