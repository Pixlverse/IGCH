import type { Metadata } from 'next'

import { getHomePage, getSiteSettings } from '@/lib/content'

export async function buildHomeMetadata(): Promise<Metadata> {
  const home = await getHomePage()
  return buildPageMetadata(home.seo, '/')
}

type JsonLdInput = {
  site: Awaited<ReturnType<typeof getSiteSettings>>
  faqs: { question: string; answer: string[] }[]
  specialities: string[]
}

/** Hospital + FAQPage structured data built from the same editable content. */
export function buildJsonLd({ site, faqs, specialities }: JsonLdInput) {
  const url = process.env.NEXT_PUBLIC_SITE_URL || site.seo.siteUrl
  const abs = (path: string) => new URL(path, url).toString()
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Hospital',
      '@id': abs('/#hospital'),
      name: site.name,
      url: abs('/'),
      ...(site.logo && { logo: abs(site.logo.src) }),
      ...(site.seo.ogImage && { image: abs(site.seo.ogImage.src) }),
      telephone: site.emergency.phone.international || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.streetAddress,
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
      emergencyService: true,
      availableService: specialities.map((name) => ({ '@type': 'MedicalSpecialty', name })),
    },
  ]
  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': abs('/#faq'),
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer.join('\n\n') },
      })),
    })
  }
  // Escape `<` so content can never close the <script> tag.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  )
}

/** Metadata for an inner page: its own title, description and canonical path. */
export async function buildPageMetadata(
  page: { title: string; description: string },
  path: string,
): Promise<Metadata> {
  const site = await getSiteSettings()
  const { seo } = site
  const title = page.title || seo.defaultTitle
  const description = page.description || seo.defaultDescription
  const images = seo.ogImage
    ? [
        {
          url: seo.ogImage.src,
          width: seo.ogImage.width,
          height: seo.ogImage.height,
          alt: seo.ogImage.alt,
        },
      ]
    : undefined

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || seo.siteUrl),
    title,
    description,
    applicationName: site.name,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: site.name,
      title,
      description,
      locale: seo.locale,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
    robots: { index: true, follow: true },
  }
}
