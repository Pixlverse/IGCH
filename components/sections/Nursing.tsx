import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { Tag } from '@/components/ui/Tag'
import type { HomePage } from '@/lib/content/schemas'

export function Nursing({ nursing }: { nursing: HomePage['nursing'] }) {
  return (
    <section className="section" id="nursing">
      <div className="nursing" data-reveal="">
        <div className="nursing__art">
          <ContentImage
            image={nursing.image}
            sizes="(max-width: 960px) 100vw, (min-width: 1560px) 680px, 44vw"
          />
        </div>
        <div className="nursing__body">
          <span>
            <Tag {...nursing.tag} />
          </span>
          <h2>{nursing.heading}</h2>
          {nursing.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {nursing.cta.label && (
            <Button href={nursing.cta.href} variant="primary">
              {nursing.cta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
