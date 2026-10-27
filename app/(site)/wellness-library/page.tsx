import { LibraryView } from '@/components/library/LibraryView'
import { QuickCheck } from '@/components/page/QuickCheck'
import { Button } from '@/components/ui/Button'
import { getLibrary, getSiteSettings } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const library = await getLibrary()
  return buildPageMetadata(library.seo, '/wellness-library')
}

export default async function WellnessLibraryPage() {
  const [site, library] = await Promise.all([getSiteSettings(), getLibrary()])
  return (
    <main>
      <LibraryView library={library} />
      <section className="section">
        <div className="help-row">
          <QuickCheck content={library.quickCheck} name="library-faq" />
          <div className="ask-doctor">
            <h2>{library.askDoctor.heading}</h2>
            <p>{library.askDoctor.note}</p>
            {site.booking.label && (
              <Button href={site.booking.href} variant="lime">
                {site.booking.label}
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
