import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const config = [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    ignores: [
      '.next/**',
      '.next-admin/**',
      '.data/**',
      'node_modules/**',
      'legacy/**',
      'test-results/**',
      'playwright-report/**',
      'tests/.artifacts/**',
      'next-env.d.ts',
    ],
  },
]

export default config
